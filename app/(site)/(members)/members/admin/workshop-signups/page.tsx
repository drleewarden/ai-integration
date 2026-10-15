import { redirect } from "next/navigation";

/** Workshop signups now live as a section of the combined Signups page. */
export default function WorkshopSignupsAdminPage() {
  redirect("/members/admin/signups?type=workshop");
}
