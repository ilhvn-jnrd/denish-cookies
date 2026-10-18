<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShippingController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
// Authentication (Rate limited)
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});
Route::post('/auth/google', [AuthController::class, 'googleLogin'])->middleware('throttle:10,1');

// Catalog
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'categories']);

// Shipping Engine (Rate limited: 20 calculations per minute per IP)
Route::post('/shipping/calculate', [ShippingController::class, 'calculate'])->middleware('throttle:20,1');
Route::get('/shipping/paxel-cities', [ShippingController::class, 'paxelCities']);
Route::get('/shipping/store-info', [ShippingController::class, 'storeInfo']);

// Orders & Checkout (Rate limited: 20 checkouts per minute per IP)
Route::post('/checkout', [OrderController::class, 'checkout'])->middleware('throttle:20,1');
Route::get('/orders/detail/{orderNumber}', [OrderController::class, 'show']);
Route::post('/orders/{orderNumber}/simulate-payment', [OrderController::class, 'simulatePayment']);

// Midtrans Webhook
Route::post('/webhooks/midtrans', [WebhookController::class, 'midtrans']);

/*
|--------------------------------------------------------------------------
| Authenticated Customer Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'profile']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Address Management with Leaflet GPS Coordinates
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
    Route::post('/addresses/{id}/default', [AddressController::class, 'setDefault']);

    // Customer Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders/{orderNumber}/cancel', [OrderController::class, 'cancel']);
});

/*
|--------------------------------------------------------------------------
| Admin Routes (Sanctum + Admin Middleware)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // KPI Dashboard
    Route::get('/dashboard', [AdminController::class, 'dashboard']);

    // Orders Management & Resi Paxel / Gojek
    Route::get('/orders', [AdminController::class, 'orders']);
    Route::put('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);

    // Products Management
    Route::get('/products', [AdminController::class, 'products']);
    Route::post('/products', [AdminController::class, 'storeProduct']);
    Route::post('/products/upload-image', [AdminController::class, 'uploadProductImage']);
    Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
    Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);

    // Shipping & Paxel Rate Matrix (Flexible support for /shipping-settings and /shipping)
    Route::match(['get'], '/shipping-settings', [AdminController::class, 'getShippingSettings']);
    Route::match(['post', 'put'], '/shipping-settings', [AdminController::class, 'updateShippingSettings']);
    Route::match(['get'], '/shipping', [AdminController::class, 'getShippingSettings']);
    Route::match(['post', 'put'], '/shipping', [AdminController::class, 'updateShippingSettings']);
    Route::post('/paxel-rates', [AdminController::class, 'storePaxelRate']);
    Route::put('/paxel-rates/{id}', [AdminController::class, 'updatePaxelRate']);
    Route::delete('/paxel-rates/{id}', [AdminController::class, 'deletePaxelRate']);
});
