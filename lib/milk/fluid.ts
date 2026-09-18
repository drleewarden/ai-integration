/**
 * Milk fluid simulation.
 *
 * A compact incompressible-fluid solver (advect, vorticity confinement,
 * Jacobi pressure projection, gradient subtract) on WebGL2 ping-pong
 * framebuffers. Vanilla WebGL2, no three.js, matching the approach already
 * used by WebGLBackground.tsx.
 *
 * No React and no DOM listeners: callers push forces in and call step/render.
 * Coordinate space is UV, 0..1 on both axes with y pointing UP.
 *
 * The dye field carries milk density rather than colour. The display pass
 * turns density into brand colour, so thick milk reads as warm cream and the
 * thin dissipating edges skin off toward pale gold.
 */

const BASE_VERT = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 texelSize;

void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const SPLAT_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;

void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(base + splat, 1.0);
}`;

const ADVECTION_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main () {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  vec4 result = texture(uSource, coord);
  // Exponential-ish decay, framerate independent enough at a clamped dt.
  float decay = 1.0 + dissipation * dt;
  fragColor = result / decay;
}`;

const DIVERGENCE_FRAG = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uVelocity;

void main () {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;

  // Reflect the centre sample at the canvas edges so milk does not leak out.
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }

  float div = 0.5 * (R - L + T - B);
  fragColor = vec4(div, 0.0, 0.0, 1.0);
}`;

const CURL_FRAG = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uVelocity;

void main () {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  fragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}`;

const VORTICITY_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;

void main () {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;

  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;

  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity += force * dt;
  velocity = min(max(velocity, -1000.0), 1000.0);
  fragColor = vec4(velocity, 0.0, 1.0);
}`;

const PRESSURE_FRAG = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;

void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  fragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;

const GRADIENT_SUBTRACT_FRAG = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;

void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity -= vec2(R - L, T - B);
  fragColor = vec4(velocity, 0.0, 1.0);
}`;

const CLEAR_FRAG = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;
uniform float value;

void main () {
  fragColor = value * texture(uTexture, vUv);
}`;

/**
 * Display pass. The dye field stores density, not colour, so this is where
 * milk gets its look:
 *
 *  - Thick milk reads as --warm-cream, the thin skinning edges ramp toward
 *    --gold-pale, so the trail dissipates into brand gold rather than grey.
 *  - Output is premultiplied alpha to pair with blendFunc(ONE,
 *    ONE_MINUS_SRC_ALPHA), giving genuine transparency over the hero. No
 *    mix-blend-mode trickery that would only work on dark sections.
 */
const DISPLAY_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;
uniform float uOpacity;

const vec3 CREAM     = vec3(0.961, 0.941, 0.910);  // #F5F0E8
const vec3 GOLD_PALE = vec3(0.957, 0.914, 0.784);  // #F4E9C8

void main () {
  float density = texture(uTexture, vUv).r;
  float a = clamp(density, 0.0, 1.0) * uOpacity;
  vec3 milk = mix(GOLD_PALE, CREAM, smoothstep(0.04, 0.5, density));
  fragColor = vec4(milk * a, a);
}`;

type Program = {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
};

type Fbo = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
};

type DoubleFbo = {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: Fbo;
  write: Fbo;
  swap: () => void;
};

export type MilkFluidOptions = {
  /** Velocity grid resolution on its short edge. */
  simResolution?: number;
  /** Dye grid resolution on its short edge. */
  dyeResolution?: number;
  /** How quickly motion dies away. Higher is thicker. */
  velocityDissipation?: number;
  /** How quickly milk fades. Lower means it lingers. */
  densityDissipation?: number;
  /** Vorticity confinement strength: the swirl in the curl. */
  curl?: number;
  /** Jacobi iterations for pressure projection. */
  pressureIterations?: number;
  /** Pressure retained between frames. */
  pressure?: number;
  /** Base splat radius. */
  splatRadius?: number;
  /** Overall opacity of the rendered milk. */
  opacity?: number;
};

export type MilkFluid = {
  /** Push motion in at a point without adding milk. dx/dy are UV per second. */
  addVelocity: (x: number, y: number, dx: number, dy: number) => void;
  /**
   * Add milk density at a point. `radiusScale` multiplies the base splat
   * radius: around 1 for the cursor trail, much smaller for droplets.
   */
  addDye: (x: number, y: number, amount: number, radiusScale?: number) => void;
  step: (dt: number) => void;
  render: () => void;
  /** Reallocates framebuffers when the backing store changed size. */
  resize: () => void;
  dispose: () => void;
};

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
    console.warn("[MilkFluid] shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vert: WebGLShader,
  frag: WebGLShader
): Program | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("[MilkFluid] program link failed:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < count; i++) {
    const name = gl.getActiveUniform(program, i)?.name;
    if (name) uniforms[name] = gl.getUniformLocation(program, name);
  }

  return { program, uniforms };
}

/** Scales a short-edge resolution to the canvas aspect. */
function resolution(gl: WebGL2RenderingContext, short: number) {
  let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspect < 1) aspect = 1 / aspect;
  const min = Math.round(short);
  const max = Math.round(short * aspect);
  return gl.drawingBufferWidth > gl.drawingBufferHeight
    ? { width: max, height: min }
    : { width: min, height: max };
}

export function createMilkFluid(
  canvas: HTMLCanvasElement,
  options: MilkFluidOptions = {}
): MilkFluid | null {
  const {
    simResolution = 128,
    dyeResolution = 768,
    velocityDissipation = 2.6,
    densityDissipation = 1.3,
    curl = 16,
    pressureIterations = 20,
    pressure = 0.8,
    splatRadius = 0.04,
    opacity = 0.85,
  } = options;

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  // Half-float render targets are required; without them the sim cannot hold
  // velocity with enough range and the effect simply does not run.
  if (!gl.getExtension("EXT_color_buffer_float")) return null;

  const vert = compile(gl, gl.VERTEX_SHADER, BASE_VERT);
  if (!vert) return null;

  const fragSources = {
    splat: SPLAT_FRAG,
    advection: ADVECTION_FRAG,
    divergence: DIVERGENCE_FRAG,
    curl: CURL_FRAG,
    vorticity: VORTICITY_FRAG,
    pressure: PRESSURE_FRAG,
    gradient: GRADIENT_SUBTRACT_FRAG,
    clear: CLEAR_FRAG,
    display: DISPLAY_FRAG,
  } as const;

  const frags: WebGLShader[] = [];
  const programs = {} as Record<keyof typeof fragSources, Program>;
  for (const [key, source] of Object.entries(fragSources)) {
    const frag = compile(gl, gl.FRAGMENT_SHADER, source);
    if (!frag) return null;
    frags.push(frag);
    const program = createProgram(gl, vert, frag);
    if (!program) return null;
    programs[key as keyof typeof fragSources] = program;
  }

  // Fullscreen quad shared by every pass.
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
    gl.STATIC_DRAW
  );
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array([0, 1, 2, 0, 2, 3]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const allocated: Fbo[] = [];

  const createFbo = (w: number, h: number): Fbo => {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA16F,
      w,
      h,
      0,
      gl.RGBA,
      gl.HALF_FLOAT,
      null
    );

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
    gl.clear(gl.COLOR_BUFFER_BIT);

    const target: Fbo = {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
    };
    allocated.push(target);
    return target;
  };

  const createDoubleFbo = (w: number, h: number): DoubleFbo => {
    let a = createFbo(w, h);
    let b = createFbo(w, h);
    return {
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      get read() {
        return a;
      },
      get write() {
        return b;
      },
      swap() {
        const tmp = a;
        a = b;
        b = tmp;
      },
    };
  };

  const releaseTargets = () => {
    for (const t of allocated) {
      gl.deleteTexture(t.texture);
      gl.deleteFramebuffer(t.fbo);
    }
    allocated.length = 0;
  };

  let dye: DoubleFbo;
  let velocity: DoubleFbo;
  let divergence: Fbo;
  let curlFbo: Fbo;
  let pressureFbo: DoubleFbo;

  const allocate = () => {
    releaseTargets();
    const sim = resolution(gl, simResolution);
    const dyeRes = resolution(gl, dyeResolution);
    dye = createDoubleFbo(dyeRes.width, dyeRes.height);
    velocity = createDoubleFbo(sim.width, sim.height);
    divergence = createFbo(sim.width, sim.height);
    curlFbo = createFbo(sim.width, sim.height);
    pressureFbo = createDoubleFbo(sim.width, sim.height);
  };

  const blit = (target: Fbo | null) => {
    if (target) {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  };

  allocate();

  const resize = () => {
    allocate();
  };

  /** Writes a Gaussian blob of `color` into `target`. */
  const splat = (
    target: DoubleFbo,
    x: number,
    y: number,
    color: [number, number, number],
    radius: number
  ) => {
    const p = programs.splat;
    gl.useProgram(p.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, target.read.texture);
    gl.uniform1i(p.uniforms.uTarget, 0);
    gl.uniform1f(
      p.uniforms.aspectRatio,
      gl.drawingBufferWidth / gl.drawingBufferHeight
    );
    gl.uniform2f(p.uniforms.point, x, y);
    gl.uniform3f(p.uniforms.color, color[0], color[1], color[2]);
    gl.uniform1f(p.uniforms.radius, radius);
    blit(target.write);
    target.swap();
  };

  /** Splat radius correction so the trail is not a dot on a 4K display. */
  const scaledRadius = (scale: number) => {
    let r = (splatRadius * scale) / 100;
    const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspect > 1) r *= aspect;
    return r;
  };

  const addVelocity = (x: number, y: number, dx: number, dy: number) => {
    splat(velocity, x, y, [dx, dy, 0], scaledRadius(1));
  };

  // Dye is density in the red channel; the display pass supplies the colour.
  const addDye = (x: number, y: number, amount: number, radiusScale = 1) => {
    splat(dye, x, y, [amount, 0, 0], scaledRadius(radiusScale));
  };

  const step = (dt: number) => {
    gl.disable(gl.BLEND);

    // Curl, then vorticity confinement: keeps the swirl alive instead of
    // letting projection smooth the milk into a flat smear.
    let p = programs.curl;
    gl.useProgram(p.program);
    gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.uniform1i(p.uniforms.uVelocity, 0);
    blit(curlFbo);

    p = programs.vorticity;
    gl.useProgram(p.program);
    gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.uniform1i(p.uniforms.uVelocity, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, curlFbo.texture);
    gl.uniform1i(p.uniforms.uCurl, 1);
    gl.uniform1f(p.uniforms.curl, curl);
    gl.uniform1f(p.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    p = programs.divergence;
    gl.useProgram(p.program);
    gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.uniform1i(p.uniforms.uVelocity, 0);
    blit(divergence);

    // Decay last frame's pressure rather than zeroing it: converges faster.
    p = programs.clear;
    gl.useProgram(p.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pressureFbo.read.texture);
    gl.uniform1i(p.uniforms.uTexture, 0);
    gl.uniform1f(p.uniforms.value, pressure);
    blit(pressureFbo.write);
    pressureFbo.swap();

    p = programs.pressure;
    gl.useProgram(p.program);
    gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, divergence.texture);
    gl.uniform1i(p.uniforms.uDivergence, 0);
    for (let i = 0; i < pressureIterations; i++) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, pressureFbo.read.texture);
      gl.uniform1i(p.uniforms.uPressure, 1);
      blit(pressureFbo.write);
      pressureFbo.swap();
    }

    p = programs.gradient;
    gl.useProgram(p.program);
    gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pressureFbo.read.texture);
    gl.uniform1i(p.uniforms.uPressure, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.uniform1i(p.uniforms.uVelocity, 1);
    blit(velocity.write);
    velocity.swap();

    p = programs.advection;
    gl.useProgram(p.program);
    gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.uniform1i(p.uniforms.uVelocity, 0);
    gl.uniform1i(p.uniforms.uSource, 0);
    gl.uniform1f(p.uniforms.dt, dt);
    gl.uniform1f(p.uniforms.dissipation, velocityDissipation);
    blit(velocity.write);
    velocity.swap();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.uniform1i(p.uniforms.uVelocity, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, dye.read.texture);
    gl.uniform1i(p.uniforms.uSource, 1);
    gl.uniform1f(p.uniforms.dissipation, densityDissipation);
    blit(dye.write);
    dye.swap();
  };

  const render = () => {
    // Premultiplied alpha: the display pass already multiplied colour by alpha.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const p = programs.display;
    gl.useProgram(p.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dye.read.texture);
    gl.uniform1i(p.uniforms.uTexture, 0);
    gl.uniform1f(p.uniforms.uOpacity, opacity);
    blit(null);
  };

  const dispose = () => {
    releaseTargets();
    for (const key of Object.keys(programs) as Array<keyof typeof programs>) {
      gl.deleteProgram(programs[key].program);
    }
    for (const frag of frags) gl.deleteShader(frag);
    gl.deleteShader(vert);
    gl.deleteBuffer(vbo);
    gl.deleteBuffer(ibo);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };

  return { addVelocity, addDye, step, render, resize, dispose };
}
