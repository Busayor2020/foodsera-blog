export type SubscribeResult = "subscribed" | "unavailable";

/**
 * Signs an address up to the newsletter. Every newsletter form calls this one
 * function. Until a newsletter provider is connected it reports
 * "unavailable", so no form claims a sign-up that didn't happen.
 */
export async function subscribe(email: string): Promise<SubscribeResult> {
  // TODO(backend): send `email` to the newsletter provider and return
  // "subscribed" once it accepts the address.
  void email;
  return "unavailable";
}
