import PageScaffold from '../../components/layout/PageScaffold';
import OraclePanel from '../../components/tools/OraclePanel';
import { useScheme } from '../../hooks/useScheme';

export default function OracleScreen() {
  const scheme = useScheme();
  return (
    <PageScaffold title="Oracle">
      <OraclePanel scheme={scheme} />
    </PageScaffold>
  );
}
