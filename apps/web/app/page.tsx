import { LandingChatFirstContent } from '../components/LandingChatFirstContent';
import { WebFooter } from '../components/WebFooter';
import { WebHeader } from '../components/WebHeader';

export default function LandingPage(): React.JSX.Element {
  return (
    <>
      <WebHeader />
      <LandingChatFirstContent />
      <WebFooter />
    </>
  );
}
