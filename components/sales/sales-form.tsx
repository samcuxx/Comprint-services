"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CartItemComponent, CartItem } from "@/components/sales/cart-item";
import {
  useCreateSale,
  generateInvoiceNumber,
  useProductsWithInventory,
  useSalesPersons,
} from "@/hooks/use-sales";
import { useCustomers } from "@/hooks/use-customers";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  Search,
  Package,
  User,
  Calculator,
  Receipt,
  Plus,
  Tag,
  ShoppingBag,
  ListFilter,
} from "lucide-react";

// Form schema for sale
const saleSchema = z.object({
  customer_id: z.string().optional(),
  sales_person_id: z.string().min(1, "Sales person is required"),
  payment_method: z.enum(["cash", "card", "transfer", "check", "other"]),
  notes: z.string().optional(),
});

type SaleFormValues = z.infer<typeof saleSchema>;

export function SalesForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(true);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
  const taxAmount = 0; // No tax for this implementation
  const totalAmount = subtotal;

  // Get current user
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  // Fetch products with inventory
  const { data: products = [], isLoading: isProductsLoading } =
    useProductsWithInventory();

  // Fetch customers
  const { data: customers = [], isLoading: isCustomersLoading } =
    useCustomers(customerSearchQuery);

  // Fetch sales persons if user is admin
  const { data: salesPersons = [], isLoading: isSalesPersonsLoading } =
    useSalesPersons();

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    if (!productSearchQuery) return true;
    const query = productSearchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
    );
  });

  // Create sale mutation
  const createSaleMutation = useCreateSale();

  // Generate invoice number on component mount
  useEffect(() => {
    const getInvoiceNumber = async () => {
      try {
        const number = await generateInvoiceNumber();
        setInvoiceNumber(number);
        setIsGeneratingInvoice(false);
      } catch (error) {
        console.error("Error generating invoice number:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate invoice number. Please try again.",
        });
        setIsGeneratingInvoice(false);
      }
    };

    getInvoiceNumber();
  }, [toast]);

  // Initialize form
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customer_id: undefined,
      sales_person_id: isAdmin ? "" : currentUser?.id || "",
      payment_method: "cash",
      notes: "",
    },
  });

  // Add product to cart
  const addToCart = (productId: string) => {
    // Check if product is already in cart
    if (cartItems.some((item) => item.product_id === productId)) {
      toast({
        variant: "default",
        title: "Product already in cart",
        description: "Adjust the quantity in the cart instead.",
      });
      return;
    }

    // Find product from products array
    const product = products.find((p) => p.id === productId);
    if (!product || !product.inventory || product.inventory.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Product not available",
      });
      return;
    }

    const availableQuantity = product.inventory[0].quantity;
    if (availableQuantity <= 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: "This product is currently out of stock.",
      });
      return;
    }

    // Add product to cart
    const newItem: CartItem = {
      product_id: product.id,
      name: product.name,
      sku: product.sku,
      image_url: product.image_url,
      quantity: 1,
      available_quantity: availableQuantity,
      unit_price: product.selling_price,
      commission_rate: product.commission_rate || 0,
      discount_percent: 0,
      total_price: product.selling_price,
    };

    setCartItems([...cartItems, newItem]);
    setProductSearchQuery("");
  };

  // Update cart item quantity
  const updateItemQuantity = (productId: string, quantity: number) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.product_id === productId) {
          const newQuantity = Math.max(
            1,
            Math.min(item.available_quantity, quantity)
          );
          const discountMultiplier = 1 - item.discount_percent / 100;
          const totalPrice = newQuantity * item.unit_price * discountMultiplier;
          return {
            ...item,
            quantity: newQuantity,
            total_price: totalPrice,
          };
        }
        return item;
      })
    );
  };

  // Update cart item discount
  const updateItemDiscount = (productId: string, discountPercent: number) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.product_id === productId) {
          const discountMultiplier = 1 - discountPercent / 100;
          const totalPrice =
            item.quantity * item.unit_price * discountMultiplier;
          return {
            ...item,
            discount_percent: discountPercent,
            total_price: totalPrice,
          };
        }
        return item;
      })
    );
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.product_id !== productId));
  };

  // Process form submission
  const onSubmit = async (data: SaleFormValues) => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Add at least one product to the cart.",
      });
      return;
    }

    try {
      // Prepare sale data
      const saleData = {
        invoice_number: invoiceNumber,
        customer_id: data.customer_id || null,
        sales_person_id: data.sales_person_id,
        sale_date: new Date().toISOString(),
        subtotal,
        tax_amount: taxAmount,
        discount_amount: cartItems.reduce(
          (sum, item) =>
            sum +
            (item.quantity * item.unit_price * item.discount_percent) / 100,
          0
        ),
        total_amount: totalAmount,
        payment_status: "paid", // Assuming cash payment is always paid
        payment_method: data.payment_method,
        notes: data.notes || null,
      };

      // Prepare sale items data
      const saleItemsData = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        commission_rate: item.commission_rate,
        discount_percent: item.discount_percent,
        total_price: item.total_price,
      }));

      // Create sale
      await createSaleMutation.mutateAsync({
        sale: saleData,
        saleItems: saleItemsData,
      });

      toast({
        title: "Success",
        description: "Sale completed successfully",
      });

      // Redirect to sales page
      router.push("/dashboard/sales");
    } catch (error: unknown) {
      console.error("Error creating sale:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to complete sale",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Products</h2>
                <Badge variant="outline" className="flex items-center gap-1">
                  <ShoppingCart className="w-3 h-3" />
                  <span>{cartItems.length} items</span>
                </Badge>
              </div>

              <div className="relative">
                <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or SKU"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-md max-h-[300px] overflow-y-auto">
                {isProductsLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading products...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No products found
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredProducts.map((product) => {
                      const isInCart = cartItems.some(
                        (item) => item.product_id === product.id
                      );
                      const inventoryItem = product.inventory?.[0];
                      const quantity = inventoryItem?.quantity || 0;

                      return (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 hover:bg-muted/50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden rounded-md bg-muted">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">
                                {product.name}
                              </h4>
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="text-muted-foreground">
                                  SKU: {product.sku}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="h-4 px-1 py-0 text-xs"
                                >
                                  {quantity} in stock
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="h-4 px-1 py-0 text-xs"
                                >
                                  {formatCurrency(product.selling_price)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant={isInCart ? "secondary" : "default"}
                            onClick={() => addToCart(product.id)}
                            disabled={isInCart || quantity <= 0}
                          >
                            {isInCart ? "Added" : "Add"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Customer (Optional)</h2>

              {/* <div className="relative mb-4">
                <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search customers by name, email or phone"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div> */}

              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="max-h-[200px] overflow-y-auto">
                          {isCustomersLoading ? (
                            <div className="p-2 text-center text-muted-foreground">
                              Loading customers...
                            </div>
                          ) : customers.length === 0 ? (
                            <div className="p-2 text-center text-muted-foreground">
                              No customers found
                            </div>
                          ) : (
                            customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                <div className="flex items-center">
                                  <User className="w-4 h-4 mr-2 text-muted-foreground" />
                                  <span>
                                    {customer.name}
                                    {customer.phone && ` • ${customer.phone}`}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a customer or leave blank for a walk-in customer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 space-y-4 border rounded-md">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <ShoppingCart className="w-5 h-5" /> Cart Summary
                </h2>
                <Badge variant="outline">
                  Invoice:{" "}
                  {isGeneratingInvoice ? "Generating..." : invoiceNumber}
                </Badge>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>Your cart is empty</p>
                  <p className="text-sm">
                    Search and add products to your cart
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-[300px] overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <CartItemComponent
                        key={item.product_id}
                        item={item}
                        onRemove={removeFromCart}
                        onQuantityChange={updateItemQuantity}
                        onDiscountChange={updateItemDiscount}
                      />
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Payment Details</h2>

              {isAdmin && (
                <FormField
                  control={form.control}
                  name="sales_person_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Person</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sales person" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isSalesPersonsLoading ? (
                            <div className="p-2 text-center text-muted-foreground">
                              Loading sales persons...
                            </div>
                          ) : salesPersons.length === 0 ? (
                            <div className="p-2 text-center text-muted-foreground">
                              No sales persons found
                            </div>
                          ) : (
                            salesPersons.map((person) => (
                              <SelectItem key={person.id} value={person.id}>
                                {person.full_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="transfer">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional information about this sale"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={
                cartItems.length === 0 ||
                isGeneratingInvoice ||
                createSaleMutation.isPending
              }
            >
              {createSaleMutation.isPending ? (
                "Processing Sale..."
              ) : (
                <>
                  <span>₵</span> Complete Sale
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
