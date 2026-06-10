import { LandingChatFirstContent } from '../components/LandingChatFirstContent';
import { LandingLightFooter } from '../components/LandingLightFooter';
import { LandingLightHeader } from '../components/LandingLightHeader';

export default function LandingPage(): React.JSX.Element {
  return (
    <>
      <LandingLightHeader />
      <LandingChatFirstContent />
      <LandingLightFooter />
    </>
  );
}
