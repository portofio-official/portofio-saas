"use client";

import { useActionState } from "react";
import { updateWorkspaceProfileAction, type WorkspaceProfileActionState } from "@/lib/workspace/profile-actions";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import styles from "@/components/auth/AuthSplitLayout.module.css";
import { useRouter } from "@/i18n/navigation";

const initialState: WorkspaceProfileActionState = { error: null };

export function WorkspaceProfileForm({ workspaceId, templateId }: { workspaceId: string, templateId?: string }) {
  const router = useRouter();
  
  // We need to bind workspaceId to the action.
  // We can do this by wrapping the action or passing it in a hidden input, 
  // but since our action takes workspaceId as the first argument, we can use bind.
  const boundAction = updateWorkspaceProfileAction.bind(null, workspaceId);
  const [state, formAction] = useActionState(boundAction, initialState);

  const handleSkip = () => {
    let href = `/dashboard/${workspaceId}/editor`;
    if (templateId) {
      href += `?templateId=${templateId}`;
    }
    router.push(href);
  };

  return (
    <form action={formAction} className={styles.loginForm}>
      <AuthInput
        label="Business Email (Optional)"
        type="email"
        name="email"
        icon="mail"
        placeholder="contact@yourbusiness.com"
      />

      <AuthInput
        label="Phone Number (Optional)"
        name="phone"
        type="tel"
        icon="call"
        placeholder="e.g. 6281234567890"
        pattern="^62[0-9]{8,15}$"
        title="Phone number must start with '62' without the '+' sign (e.g. 6281234567890)"
      />

      <AuthInput
        label="Website URL (Optional)"
        name="websiteUrl"
        type="url"
        icon="language"
        placeholder="https://yourwebsite.com"
      />

      <AuthInput
        label="Address (Optional)"
        name="address"
        type="text"
        icon="location_on"
        placeholder="City, Country or Full Address"
      />

      {state.error && (
        <p className="text-sm text-danger" style={{ color: "red", fontSize: "0.875rem" }}>
          {state.error === "validationError" ? "Please check your input format." : "Failed to save profile. Please try again."}
        </p>
      )}

      <AuthSubmitButton label="Save Profile" pendingLabel="Saving..." />
      
      <button 
        type="button" 
        onClick={handleSkip}
        className="mt-2 text-sm text-center" 
        style={{ color: "var(--text-soft)", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}
      >
        Skip for now
      </button>
    </form>
  );
}
