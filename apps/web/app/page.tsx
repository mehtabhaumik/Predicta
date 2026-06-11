import { LandingChatFirstContent } from '../components/LandingChatFirstContent';
import { LandingLightFooter } from '../components/LandingLightFooter';
import { LandingLightHeader } from '../components/LandingLightHeader';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function LandingPage(): React.JSX.Element {
  return (
    <>
      <LandingLightHeader />
      <LandingChatFirstContent />
      <LandingLightFooter />
    </>
  );
}
