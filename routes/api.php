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
// Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Catalog
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'categories']);

// Shipping Engine
Route::post('/shipping/calculate', [ShippingController::class, 'calculate']);
Route::get('/shipping/paxel-cities', [ShippingController::class, 'paxelCities']);
Route::get('/shipping/store-info', [ShippingController::class, 'storeInfo']);

// Orders & Checkout
Route::post('/checkout', [OrderController::class, 'checkout']);
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
    Route::post('/logout', [AuthController::class, 'logout']);

    // Address Management with Leaflet GPS Coordinates
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
    Route::post('/addresses/{id}/default', [AddressController::class, 'setDefault']);

    // Customer Orders
    Route::get('/orders', [OrderController::class, 'index']);
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
    Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
    Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);

    // Shipping & Paxel Rate Matrix
    Route::get('/shipping-settings', [AdminController::class, 'getShippingSettings']);
    Route::put('/shipping-settings', [AdminController::class, 'updateShippingSettings']);
    Route::post('/paxel-rates', [AdminController::class, 'storePaxelRate']);
    Route::put('/paxel-rates/{id}', [AdminController::class, 'updatePaxelRate']);
    Route::delete('/paxel-rates/{id}', [AdminController::class, 'deletePaxelRate']);
});
