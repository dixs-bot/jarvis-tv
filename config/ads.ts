import type { AdConfig } from "@/types";

const flag = (v: string | undefined, fallback: boolean) =>
  v === undefined || v === "" ? fallback : v.toLowerCase() === "true";

/** Adsterra publisher snippets. Each slot is isolated in its own iframe by AdSlot. */
export const adConfig: AdConfig = {
  enabled: flag(process.env.NEXT_PUBLIC_ADS_ENABLED, true),
  showPlaceholders: flag(process.env.NEXT_PUBLIC_ADS_PLACEHOLDERS, true),
  top: {
    enabled: true,
    code: `<script>var atOptions = { key: '2b3a2868c6f8c4600f7b5ca598087510', format: 'iframe', height: 60, width: 468, params: {} };</script><script src="https://czernik.org/22/2b3a2868c6f8c4600f7b5ca598087510"></script>`,
    width: 468,
    height: 60,
  },
  bottom: {
    enabled: true,
    code: `<script>var atOptions = { key: '68ae66bf3e16d1f71469d579bb99b716', format: 'iframe', height: 250, width: 300, params: {} };</script><script src="https://czernik.org/22/68ae66bf3e16d1f71469d579bb99b716"></script>`,
    width: 300,
    height: 250,
  },
  sidebar: {
    enabled: true,
    code: `<script>var atOptions = { key: 'c8899a337b34bd1d9ff9ccac17f22eff', format: 'iframe', height: 600, width: 160, params: {} };</script><script src="https://czernik.org/22/c8899a337b34bd1d9ff9ccac17f22eff"></script>`,
    width: 160,
    height: 600,
  },
  overlay: {
    enabled: false,
    code: `<script>var atOptions = { key: 'af119e595f71c936e670f2bc240bdfae', format: 'iframe', height: 300, width: 160, params: {} };</script><script src="https://czernik.org/22/af119e595f71c936e670f2bc240bdfae"></script>`,
    width: 160,
    height: 300,
  },
};
