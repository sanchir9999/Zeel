// Demo барааны мэдээлэл нэмэх
export const addDemoProducts = () => {
    if (typeof window === 'undefined') return

    // Мангас агуулах
    const mangasProducts = [
        { id: '1', name: 'Coca Cola', category: 'drinks', brand: 'Coca Cola', size: '0.5л', quantity: 50, price: 1500, costPrice: 1200, addedDate: new Date().toISOString(), storeId: 'mangas' },
        { id: '2', name: 'Coca Cola', category: 'drinks', brand: 'Coca Cola', size: '1.5л', quantity: 30, price: 3500, costPrice: 2800, addedDate: new Date().toISOString(), storeId: 'mangas' },
        { id: '3', name: 'Coca Cola', category: 'drinks', brand: 'Coca Cola', size: '2л', quantity: 20, price: 4500, costPrice: 3600, addedDate: new Date().toISOString(), storeId: 'mangas' },
        { id: '4', name: 'Pepsi', category: 'drinks', brand: 'Pepsi', size: '0.5л', quantity: 40, price: 1400, costPrice: 1100, addedDate: new Date().toISOString(), storeId: 'mangas' },
        { id: '5', name: 'Pepsi', category: 'drinks', brand: 'Pepsi', size: '1.5л', quantity: 25, price: 3200, costPrice: 2500, addedDate: new Date().toISOString(), storeId: 'mangas' },
        { id: '6', name: 'Sprite', category: 'drinks', brand: 'Coca Cola', size: '0.5л', quantity: 35, price: 1500, costPrice: 1200, addedDate: new Date().toISOString(), storeId: 'mangas' },
        { id: '7', name: 'Fanta', category: 'drinks', brand: 'Coca Cola', size: '0.5л', quantity: 30, price: 1500, costPrice: 1200, addedDate: new Date().toISOString(), storeId: 'mangas' },
        { id: '8', name: 'Усны лонх', category: 'drinks', brand: 'Монгол Ус', size: '0.5л', quantity: 100, price: 800, costPrice: 600, addedDate: new Date().toISOString(), storeId: 'mangas' },
        { id: '9', name: 'Пиво', category: 'drinks', brand: 'Чингис', size: '0.5л', quantity: 60, price: 4500, costPrice: 3500, addedDate: new Date().toISOString(), storeId: 'mangas' },
        { id: '10', name: 'Айраг', category: 'drinks', brand: 'Монгол Айраг', size: '1л', quantity: 15, price: 8000, costPrice: 6000, addedDate: new Date().toISOString(), storeId: 'mangas' }
    ]

    // Үндсэн дэлгүүр
    const mainProducts = [
        { id: '11', name: 'Талх', category: 'food', brand: 'Гурван Гол', size: 'Жижиг', quantity: 80, price: 1200, costPrice: 900, addedDate: new Date().toISOString(), storeId: 'main' },
        { id: '12', name: 'Талх', category: 'food', brand: 'Гурван Гол', size: 'Том', quantity: 60, price: 1800, costPrice: 1400, addedDate: new Date().toISOString(), storeId: 'main' },
        { id: '13', name: 'Сүү', category: 'dairy', brand: 'Улаан Од', size: '1л', quantity: 45, price: 2500, costPrice: 2000, addedDate: new Date().toISOString(), storeId: 'main' },
        { id: '14', name: 'Өндөг', category: 'food', brand: 'Органик', size: '10ш', quantity: 30, price: 4500, costPrice: 3500, addedDate: new Date().toISOString(), storeId: 'main' },
        { id: '15', name: 'Будаа', category: 'food', brand: 'Тайланд', size: '1кг', quantity: 25, price: 3500, costPrice: 2800, addedDate: new Date().toISOString(), storeId: 'main' },
        { id: '16', name: 'Гурил', category: 'food', brand: 'Монгол', size: '1кг', quantity: 40, price: 2800, costPrice: 2200, addedDate: new Date().toISOString(), storeId: 'main' },
        { id: '17', name: 'Өрөөс', category: 'dairy', brand: 'Эрдэнэт', size: '500гр', quantity: 20, price: 8500, costPrice: 7000, addedDate: new Date().toISOString(), storeId: 'main' },
        { id: '18', name: 'Чанасан мах', category: 'food', brand: 'Хадгалуулсан', size: '400гр', quantity: 35, price: 6500, costPrice: 5000, addedDate: new Date().toISOString(), storeId: 'main' },
        { id: '19', name: 'Макарон', category: 'food', brand: 'Италик', size: '500гр', quantity: 50, price: 2200, costPrice: 1700, addedDate: new Date().toISOString(), storeId: 'main' },
        { id: '20', name: 'Чихэр', category: 'food', brand: 'Сахарный', size: '1кг', quantity: 30, price: 2500, costPrice: 2000, addedDate: new Date().toISOString(), storeId: 'main' }
    ]

    // 255 агуулах  
    const warehouse255Products = [
        { id: '21', name: 'Шампунь', category: 'personal', brand: 'Pantene', size: '400мл', quantity: 25, price: 8500, costPrice: 6500, addedDate: new Date().toISOString(), storeId: 'warehouse255' },
        { id: '22', name: 'Шүдний оо', category: 'personal', brand: 'Colgate', size: '100мл', quantity: 40, price: 3500, costPrice: 2800, addedDate: new Date().toISOString(), storeId: 'warehouse255' },
        { id: '23', name: 'Савангийн нунтаг', category: 'cleaning', brand: 'Tide', size: '500гр', quantity: 30, price: 6500, costPrice: 5000, addedDate: new Date().toISOString(), storeId: 'warehouse255' },
        { id: '24', name: 'Цаасан алчуур', category: 'personal', brand: 'Kleenex', size: '200ш', quantity: 50, price: 2800, costPrice: 2200, addedDate: new Date().toISOString(), storeId: 'warehouse255' },
        { id: '25', name: 'Угаалгын нунтаг', category: 'cleaning', brand: 'Ariel', size: '1кг', quantity: 20, price: 12000, costPrice: 9500, addedDate: new Date().toISOString(), storeId: 'warehouse255' },
        { id: '26', name: 'Дэлхийн цав', category: 'cleaning', brand: 'Fairy', size: '500мл', quantity: 35, price: 4500, costPrice: 3500, addedDate: new Date().toISOString(), storeId: 'warehouse255' },
        { id: '27', name: 'Угаалгын шэршүүлэг', category: 'cleaning', brand: 'Lenor', size: '500мл', quantity: 25, price: 5500, costPrice: 4200, addedDate: new Date().toISOString(), storeId: 'warehouse255' },
        { id: '28', name: 'Гар угаах сав', category: 'cleaning', brand: 'Dettol', size: '250мл', quantity: 30, price: 3800, costPrice: 3000, addedDate: new Date().toISOString(), storeId: 'warehouse255' },
        { id: '29', name: 'Ариутгагч', category: 'cleaning', brand: 'Clorox', size: '500мл', quantity: 15, price: 4200, costPrice: 3300, addedDate: new Date().toISOString(), storeId: 'warehouse255' },
        { id: '30', name: 'Гоо сайхны маск', category: 'personal', brand: 'Face Shop', size: '1ш', quantity: 60, price: 2500, costPrice: 1800, addedDate: new Date().toISOString(), storeId: 'warehouse255' }
    ]

    // localStorage-д хадгалах
    localStorage.setItem('products_mangas', JSON.stringify(mangasProducts))
    localStorage.setItem('products_main', JSON.stringify(mainProducts))
    localStorage.setItem('products_warehouse255', JSON.stringify(warehouse255Products))

    console.log('Demo products added successfully!')
}