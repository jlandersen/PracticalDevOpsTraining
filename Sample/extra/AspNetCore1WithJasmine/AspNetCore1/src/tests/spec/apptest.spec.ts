import 'reflect-metadata';
import 'zone.js';
import { AppComponent, IBook } from '../../app/app.component';
import { Observable } from 'rx';
import {Http, HTTP_PROVIDERS} from 'angular2/http';

describe("Books application", () => {
    describe("shopping cart", () => {
        it("should contain books when adding to cart",
            () => {                
                var sut = new AppComponent();
                var book: IBook = {
                    id: 1,
                    title: "Revenge of the Knight",
                    description: "Lorem ipsum",
                    price: 42
                };

                sut.addToShoppingCart(book);

                expect(sut.cart.length).toBe(1);
            });

        it("should be empty when nothing is added",
            () => {
                var sut = new AppComponent();

                expect(sut.cart.length).toBe(0);
            });
    });
});