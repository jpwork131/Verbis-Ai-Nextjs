import EntrackrHomepage from '@views/EntrackrHomepage';
import MarketNewsWidget from '@components/magazine/MarketNewsWidget';

export default function Page() {
  return (
    <EntrackrHomepage 
      marketNewsWidget={<MarketNewsWidget />} 
    />
  );
}
