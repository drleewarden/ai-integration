/**
 * Ripple height field.
 *
 * A damped wave simulation on ping-pong textures. Each texel holds the
 * surface height now (red) and one step ago (green); the update shader runs
 * the standard discrete wave step, so rings expand, bounce off the edges and
 * interfere with each other without any of that being coded explicitly.
 *
 * Deliberately borrows the host's WebGL2 context rather than creating one:
 * the hero renders through a single context, and the background shader reads
 * this height field directly as a texture.
 *
 * Coordinate space is UV, 0..1 on both axes with y pointing UP.
 */

const QUAD_VERT = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

/**
 * One step of the wave equation.
 *
 * height = (left + right + top + bottom) / 2 - previous, damped. Neighbours
 * outside the field fall back to the centre sample, which reflects the wave
 * at the canvas edge instead of letting it drain away.
 */
const WAVE_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uState;
uniform vec2 texelSize;
uniform float damping;

float heightAt (vec2 uv, float fallback) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return fallback;
  return texture(uState, uv).r;
}

void main () {
  vec2 state = texture(uState, vUv).rg;
  float here = state.r;
  float before = state.g;

  float l = heightAt(vUv - vec2(texelSize.x, 0.0), here);
  float r = heightAt(vUv + vec2(texelSize.x, 0.0), here);
  float t = heightAt(vUv + vec2(0.0, texelSize.y), here);
  float b = heightAt(vUv - vec2(0.0, texelSize.y), here);

  float next = ((l + r + t + b) * 0.5 - before) * damping;

  // Round off denormals so a settled surface reaches exactly flat and stops
  // costing anything visually.
  if (abs(next) < 0.0004) next = 0.0;

  fragColor = vec4(next, here, 0.0, 1.0);
}`;

/** Presses a Gaussian dent into the surface. */
const DROP_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uState;
uniform vec2 point;
uniform float radius;
uniform float strength;
uniform float aspectRatio;

void main () {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  float dent = exp(-dot(p, p) / radius) * strength;
  vec2 state = texture(uState, vUv).rg;
  fragColor = vec4(state.r + dent, state.g, 0.0, 1.0);
}`;

export type RippleFieldOptions = {
  /**
   * Height-field resolution on the short edge. Waves travel one texel per
   * step, so a coarser field is also a faster one: this trades ring detail
   * for rings that visibly cross the hero instead of sitting where they were
   * made.
   */
  resolution?: number;
  /** Energy retained per step. Lower settles faster. */
  damping?: number;
};

export type RippleField = {
  /** Disturb the surface. `strength` may be negative for a dent. */
  drop: (x: number, y: number, strength: number, radius: number) => void;
  /** Advance the simulation one step. */
  step: () => void;
  /** Height field for the display shader: red is now, green is one step ago. */
  readonly texture: WebGLTexture;
  resize: () => void;
  dispose: () => void;
};

type Target = { texture: WebGLTexture; fbo: WebGLFramebuffer };

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[ripples] shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(
  gl: WebGL2RenderingContext,
  vert: WebGLShader,
  frag: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  // The host shader binds its own attribute at 0; match it so one quad buffer
  // serves both.
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("[ripples] program link failed:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * Returns null when the context cannot support the simulation, which the
 * caller must treat as "no ripples" rather than an error.
 */
export function createRippleField(
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  options: RippleFieldOptions = {}
): RippleField | null {
  const { resolution = 200, damping = 0.994 } = options;

  // Half-float render targets carry the signed heights the wave step needs.
  if (!gl.getExtension("EXT_color_buffer_float")) return null;

  const vert = compile(gl, gl.VERTEX_SHADER, QUAD_VERT);
  const waveFrag = compile(gl, gl.FRAGMENT_SHADER, WAVE_FRAG);
  const dropFrag = compile(gl, gl.FRAGMENT_SHADER, DROP_FRAG);
  if (!vert || !waveFrag || !dropFrag) return null;

  const waveProgram = link(gl, vert, waveFrag);
  const dropProgram = link(gl, vert, dropFrag);
  if (!waveProgram || !dropProgram) return null;

  const waveUniforms = {
    uState: gl.getUniformLocation(waveProgram, "uState"),
    texelSize: gl.getUniformLocation(waveProgram, "texelSize"),
    damping: gl.getUniformLocation(waveProgram, "damping"),
  };
  const dropUniforms = {
    uState: gl.getUniformLocation(dropProgram, "uState"),
    point: gl.getUniformLocation(dropProgram, "point"),
    radius: gl.getUniformLocation(dropProgram, "radius"),
    strength: gl.getUniformLocation(dropProgram, "strength"),
    aspectRatio: gl.getUniformLocation(dropProgram, "aspectRatio"),
  };

  // Own quad, so stepping the simulation never disturbs the host's buffer
  // bindings beyond what restoreHostState puts back.
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );

  let width = 0;
  let height = 0;
  let front: Target;
  let back: Target;

  const createTarget = (w: number, h: number): Target => {
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return { texture, fbo };
  };

  const destroyTargets = () => {
    for (const target of [front, back]) {
      if (!target) continue;
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.fbo);
    }
  };

  const allocate = () => {
    const aspect =
      (canvas.width || 1) / (canvas.height || 1) || 1;
    const w = aspect >= 1 ? Math.round(resolution * aspect) : resolution;
    const h = aspect >= 1 ? resolution : Math.round(resolution / aspect);
    if (w === width && h === height) return;
    destroyTargets();
    width = w;
    height = h;
    front = createTarget(w, h);
    back = createTarget(w, h);
  };

  allocate();

  /**
   * Hands the context back the way the host left it. The host draws a single
   * fullscreen triangle from its own buffer to the default framebuffer, so
   * that is what has to be restored.
   */
  const restoreHostState = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  };

  const bindQuad = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  };

  const drop = (x: number, y: number, strength: number, radius: number) => {
    // Read front, write back, swap: a drop is just another pass over the field.
    gl.useProgram(dropProgram);
    bindQuad();
    gl.bindFramebuffer(gl.FRAMEBUFFER, back.fbo);
    gl.viewport(0, 0, width, height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, front.texture);
    gl.uniform1i(dropUniforms.uState, 0);
    gl.uniform2f(dropUniforms.point, x, y);
    gl.uniform1f(dropUniforms.radius, radius);
    gl.uniform1f(dropUniforms.strength, strength);
    gl.uniform1f(dropUniforms.aspectRatio, width / height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const swap = front;
    front = back;
    back = swap;
    restoreHostState();
  };

  const step = () => {
    gl.useProgram(waveProgram);
    bindQuad();
    gl.bindFramebuffer(gl.FRAMEBUFFER, back.fbo);
    gl.viewport(0, 0, width, height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, front.texture);
    gl.uniform1i(waveUniforms.uState, 0);
    gl.uniform2f(waveUniforms.texelSize, 1 / width, 1 / height);
    gl.uniform1f(waveUniforms.damping, damping);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const swap = front;
    front = back;
    back = swap;
    restoreHostState();
  };

  return {
    drop,
    step,
    get texture() {
      return front.texture;
    },
    resize: allocate,
    dispose: () => {
      destroyTargets();
      gl.deleteProgram(waveProgram);
      gl.deleteProgram(dropProgram);
      gl.deleteShader(vert);
      gl.deleteShader(waveFrag);
      gl.deleteShader(dropFrag);
      gl.deleteBuffer(quad);
    },
  };
}
