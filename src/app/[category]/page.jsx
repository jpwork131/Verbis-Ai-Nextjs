import CategoryView from '@/views/CategoryView';

export async function generateMetadata({ params }) {
  const { category } = await params;
  const displayName = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return {
    title: `${displayName} | Verbis AI News`,
    description: `Latest news and updates about ${displayName} from Verbis AI.`,
  };
}

export default async function Page({ params }) {
  const { category } = await params;
  return <CategoryView categorySlug={category} />;
}
