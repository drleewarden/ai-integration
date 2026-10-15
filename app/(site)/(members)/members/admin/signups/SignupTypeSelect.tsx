"use client";

import { useRouter } from "next/navigation";
import { SIGNUP_TYPES, type SignupType } from "@/lib/admin/signups";

/** Section picker: switching the dropdown reloads the page with ?type=. */
export default function SignupTypeSelect({
  value,
  labels,
}: {
  value: SignupType;
  labels: Record<SignupType, string>;
}) {
  const router = useRouter();

  return (
    <label className="signups-select">
      <span>Show</span>
      <select
        value={value}
        onChange={(e) => router.push(`/members/admin/signups?type=${e.target.value}`)}
      >
        {SIGNUP_TYPES.map((type) => (
          <option key={type} value={type}>
            {labels[type]}
          </option>
        ))}
      </select>
    </label>
  );
}
