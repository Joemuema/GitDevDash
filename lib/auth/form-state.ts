/**
 * Shared auth form state.
 *
 * This lives outside `actions.ts` on purpose: a `"use server"` module may only
 * export async functions, so the initial state and its type must be defined in
 * a plain module and imported by both the actions and the client component.
 */
export type AuthFormState = {
  status: "idle" | "error" | "info" | "success"
  message: string
}

export const initialAuthFormState: AuthFormState = {
  status: "idle",
  message: "",
}

export type GoogleAuthResult =
  | { status: "redirect"; url: string }
  | { status: "unconfigured"; message: string }