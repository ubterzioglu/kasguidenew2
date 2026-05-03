export function mapCategoryToSchemaType(categoryId: string | null | undefined): string {
  switch (categoryId) {
    case 'restoran':
    case 'meyhane':
    case 'kahvalti':
      return 'Restaurant'
    case 'cafe':
      return 'CafeOrCoffeeShop'
    case 'bar':
      return 'BarOrPub'
    case 'oteller':
      return 'LodgingBusiness'
    case 'plaj':
    case 'tarih':
    case 'doga':
    case 'gezi':
      return 'TouristAttraction'
    case 'carsi':
      return 'Store'
    case 'dalis':
    case 'aktivite':
      return 'LocalBusiness'
    default:
      return 'LocalBusiness'
  }
}
