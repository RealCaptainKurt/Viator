import PageScaffold from '../../components/layout/PageScaffold';
import DicePanel from '../../components/tools/DicePanel';
import { useScheme } from '../../hooks/useScheme';

export default function DiceScreen() {
  const scheme = useScheme();
  return (
    <PageScaffold title="Dice Roller">
      <DicePanel scheme={scheme} />
    </PageScaffold>
  );
}
