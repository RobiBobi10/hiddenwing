# Family Onboarding — inviting people to Hiddenwing

_Status: Active · Owner: You · Part of [Milestone 6](milestone-6-polish-price-integrity-launch.md)_

Hiddenwing is a **private** tool for a handful of known people. Keeping it invite-only is what keeps
it on the simple, cheap, legally-light side of the [Family Edition boundary](../FAMILY-EDITION.md)
(no strangers, no compliance machinery). Here's how to add family members and keep it private.

## 1. Keep sign-up private (do this once)

By default Clerk lets anyone with the link create an account. Lock it down so only people you invite
can get in:

1. Go to the **Clerk dashboard** → your app → **Configure → Restrictions**.
2. Turn on **Allowlist** and add each family member's email address — only those can sign up.
   _(Alternative: disable self-serve sign-up entirely and use Clerk **Invitations** to send each
   person a link.)_
3. Save. Now the deployed site rejects anyone not on the list.

That single setting is the "no strangers" guard. Everything else in this doc assumes it's on.

## 2. Add a family member

- **Allowlist route:** add their email in Clerk → Restrictions, then send them the site link
  (`https://hiddenwing.vercel.app`). They sign up with that email and they're in.
- **Invitation route:** Clerk → **Users → Invite**, enter their email; Clerk emails them a link.

When they first sign in, the Clerk webhook creates their row in the database automatically (M1), and
they get their **own** preference profile (M5) — so their rankings are personal from day one.

## 3. First-run guide (share this with them)

> **Welcome to Hiddenwing.** Sign in, then:
> 1. Open **Search**. Type a trip in plain words — *"cheap flights from London to New York in
>    September for 2 adults"* — or fill in the form.
> 2. Results are ranked **best-value-first** for *you*, not just cheapest. Tap **"Why this pick?"**
>    for a plain explanation.
> 3. Set your **preferences** (the "Your preferences" link) once — e.g. never red-eyes, always a
>    checked bag — and every future search respects them.
> 4. Try **flexible dates / nearby airports** in the form to catch cheaper options.
> 5. Before booking, hit **"Confirm price"** to check the fare is still live, then book directly on
>    the airline's site. (Hiddenwing never takes payment — it finds the trip, you book it.)

## 4. Removing someone
Clerk → **Users** → select the person → **Delete**. The webhook removes their database row too.

---
See also: the [launch checklist](launch-checklist.md) and, if you ever open it up,
[before you go public](before-you-go-public.md).
