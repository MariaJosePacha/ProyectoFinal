import fs from "fs";

class CartManager {
    constructor(path) {
        this.path = path;
        this.carts = [];
        this.ultId = 0;

        this.cargarCarritos();
    }

    async cargarCarritos() {
        try {
            const data = await fs.promises.readFile(this.path, "utf-8");
            this.carts = JSON.parse(data);
            if (this.carts.length > 0) {
                this.ultId = Math.max(...this.carts.map(cart => cart.id));
            }
        } catch (error) {
            if (error.code === "ENOENT") {
                console.log("El archivo no existe, se creará uno nuevo.");
                await this.guardarCarritos();
            } else {
                console.log("Error al cargar los carritos:", error);
                throw new Error("Error al cargar los carritos");
            }
        }
    }

    async guardarCarritos() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2));
        } catch (error) {
            console.log("Error al guardar los carritos:", error);
            throw new Error("No se pudo guardar el archivo de carritos");
        }
    }

    async crearCarrito() {
        const nuevoCarrito = {
            id: ++this.ultId,
            products: []
        };

        this.carts.push(nuevoCarrito);
        await this.guardarCarritos();
        return nuevoCarrito;
    }

    async getCarritoById(carritoId) {
        if (isNaN(carritoId)) {
            throw new Error(`El ID del carrito debe ser un número válido.`);
        }

        const carritoBuscado = this.carts.find(carrito => carrito.id === carritoId);
        if (!carritoBuscado) 
            {
            throw new Error(`No existe un carrito con el id: ${carritoId}`);
        }

        return carritoBuscado;
    }

    async agregarProductoAlCarrito(carritoId, productoId, quantity = 1) {
        if (isNaN(carritoId) || isNaN(productoId)) {
            throw new Error(`El ID del carrito y del producto deben ser números válidos.`);
        }

        const carrito = await this.getCarritoById(carritoId);
        const existeProducto = carrito.products.find(p => p.product === productoId);

        if (existeProducto) {
            
            existeProducto.quantity += quantity;
        } else {
            
            carrito.products.push({ product: productoId, quantity });
        }

        await this.guardarCarritos();
        return carrito;
    }
}

export default CartManager;
