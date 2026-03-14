import EntrackrHomepage from '../views/EntrackrHomepage';
import MarketNewsWidget from '../components/magazine/MarketNewsWidget';
import StartupEcosystemWidget from '../components/magazine/StartupEcosystemWidget';

export default function Page() {
  return (
    <EntrackrHomepage 
      marketNewsWidget={<MarketNewsWidget />} 
      startupWidget={<StartupEcosystemWidget />}
    />
  );
}
