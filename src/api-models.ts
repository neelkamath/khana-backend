export interface Account {
    readonly emailAddress: string;
    readonly password: string;
    readonly role: Role;
}

export type Role = 'student' | 'cook';

export interface MenuItem {
    readonly foodPoint: FoodPoint;
    readonly name: string;
    readonly picUrl?: string;
    readonly quantity: number;
    readonly price: number;
    readonly id: string;
}

export interface Menu {
    readonly items: MenuItem[];
}

export interface NewOrder {
    readonly foodPoint: FoodPoint;
    readonly items: NewOrderItem[];
}

export interface NewOrderItem {
    readonly id: string;
    readonly quantity: number;
}

export type FoodPoint = 'APU' | 'Engineering Block' | 'Breakfast and Snacks Food Bus' | 'Lunch Food Bus';

export interface PlacedOrders {
    readonly orders: PlacedOrder[];
}

export interface PlacedOrder {
    readonly token: string;
    readonly status: OrderStatus;
    readonly foodPoint: FoodPoint;
    readonly items: PlacedOrderItem[];
    readonly price: number;
}

export interface PlacedOrderItem {
    readonly quantity: number;
    readonly price: number;
    readonly name: string;
}

export type OrderStatus = 'PREPARING' | 'PREPARED' | 'PICKED_UP';

export interface IncompleteOrders {
    readonly orders: IncompleteOrder[];
}

export interface IncompleteOrder {
    readonly token: string;
    readonly status: IncompleteOrderStatus;
    readonly price: number;
    readonly items: IncompleteOrderItem[];
}

export interface IncompleteOrderItem {
    readonly quantity: number;
    readonly name: string;
}

export type IncompleteOrderStatus = 'PREPARING' | 'PREPARED';