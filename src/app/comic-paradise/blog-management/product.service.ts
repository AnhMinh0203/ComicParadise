import { Injectable } from '@angular/core';
import { Story} from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
    constructor() {}

    getProductsSmall(): Promise<Product[]> {
        return new Promise((resolve) => {
            resolve([
                {
                    id: '1000',
                    code: 'f230fh0g3',
                    name: 'Bamboo Watch',
                    description: 'StoryDescription',
                    image: 'assets/images/bamboo-watch.jpg',
                    price: 65,
                    category: 'Accessories',
                    quantity: 24,
                    inventoryStatus: 'INSTOCK',
                    rating: 5
                },
                {
                    id: '1001',
                    code: 'nvklal433',
                    name: 'Black Watch',
                    description: 'StoryDescription',
                    image: 'assets/images/black-watch.jpg',
                    price: 72,
                    category: 'Accessories',
                    quantity: 0,
                    inventoryStatus: 'OUTOFSTOCK',
                    rating: 4
                },
                {
                    id: '1002',
                    code: 'zz21cz3c1',
                    name: 'Blue Band',
                    description: 'StoryDescription',
                    image: 'assets/images/blue-band.jpg',
                    price: 79,
                    category: 'Fitness',
                    quantity: 15,
                    inventoryStatus: 'LOWSTOCK',
                    rating: 3
                }
            ]);
        });
    }
}
