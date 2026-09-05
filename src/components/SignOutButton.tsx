import { signOutAction } from "@/app/logout/actions";

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="text-[11px] text-[#8FA88B] hover:text-[#EFE7D2] text-left">
        Sign out
      </button>
    </form>
  );
}
