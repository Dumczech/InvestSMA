import { AdminPlaceholder } from '../_components/AdminPlaceholder';

export default function Page() {
  return (
    <AdminPlaceholder
      crumbs={['Metrics & Stats']}
      title='Metrics & Stats'
      subtitle='Funnel, ROI submissions, traffic, conversion. Pulls from event_tracking + leads.'
      icon='pulse'
    />
  );
}
