# QuickBytes WebPay

A JavaScript/TypeScript library for integrating [QuickBytes](https://quickbytes.exchange) micropayments into web applications. This library provides both a programmatic API and a customizable web component for handling micropayments through the QuickBytes payment system.

Visit [quickbytes.exchange](https://quickbytes.exchange) to learn more about QuickBytes micropayments.

## Features

- Easy-to-use payment API for handling micropayments
- Customizable web component (`<quickbytes-pay-button>`) for quick integration
- TypeScript support with full type definitions
- Supports both UMD and ES modules
- Built-in validation and error handling
- Secure payment flow using popup windows
- Comprehensive payment status tracking and verification
- Supports light/dark themes and multiple size options for the payment button

## Installation

```bash
npm install @quickbytes/webpay
```

## Quick Start

### Basic Integration (CDN)

```html
<!DOCTYPE html>
<html>
<head>
    <title>QuickBytes Payment Example</title>
    <script src="https://cdn.quickbytes.exchange/webpay/v1/quickbytes-webpay.js"></script>
</head>
<body>
    <!-- Add the payment button -->
    <quickbytes-pay-button 
        cents="100"
        payment-address="YOUR_ALGORAND_ADDRESS">
    </quickbytes-pay-button>

    <script>
        // Get the button element
        const payButton = document.querySelector('quickbytes-pay-button');

        // Handle successful payments
        payButton.addEventListener('quickbytes-success', (event) => {
            const paymentData = event.detail;
            alert('Payment successful! Transaction ID: ' + paymentData.txn_id);
        });

        // Handle payment errors
        payButton.addEventListener('quickbytes-error', (event) => {
            console.error('Payment failed:', event.detail);
        });

        // Handle window close
        payButton.addEventListener('quickbytes-closed', () => {
            console.log('Payment window closed');
        });
    </script>
</body>
</html>
```

### Using the JavaScript API

```javascript
import { QuickBytesPayment } from '@quickbytes/webpay';

const payment = new QuickBytesPayment();

payment.createPayment({
  cents: 100,
  payment_address: 'YOUR_ALGORAND_ADDRESS',
  payee_name: 'Store Name',
  item_name: 'Product Name',
  onSuccess: (response) => {
    console.log('Payment successful:', response);
  },
  onError: (error) => {
    console.error('Payment failed:', error);
  },
  onClose: () => {
    console.log('Payment window closed');
  }
});
```

## Web Component Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| cents | number | Yes | Amount in cents to charge |
| payment-address | string | Yes | Algorand address to receive payment |
| payee-name | string | No | Name of the payee |
| item-name | string | No | Name of the item being purchased |
| size | 'small' \| 'default' \| 'large' | No | Button size variant |
| theme | 'default' \| 'dark' \| 'light' | No | Button color theme |
| disabled | boolean | No | Disable the button |
| testmode | boolean | No | Enable test mode for development |

### Development-only Attributes

The following attributes are only for use in development or custom environments:

| Attribute | Type | Description |
|-----------|------|-------------|
| app-url | string | Custom payment window URL |
| api-url | string | Custom API endpoint URL |

## Events

The web component emits the following events:

- `quickbytes-success`: Fired when payment is successful
- `quickbytes-error`: Fired when payment fails
- `quickbytes-closed`: Fired when payment window is closed

## Configuration

You can configure the QuickBytes payment system with various options:

```javascript
const payment = new QuickBytesPayment({
  baseUrl: 'https://custom.payment.url',  // Custom payment window URL
  apiUrl: 'https://custom.api.url',       // Custom API endpoint
  popupWidth: 600,                        // Custom popup width
  popupHeight: 800,                       // Custom popup height
});
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

## Browser Support

This library supports all modern browsers that implement the Web Components v1 specification and the `window.crypto.randomUUID()` API.

## License

ISC

## Support

For questions and support:
- Visit our [documentation](https://quickbytes.exchange/docs)
- Join our [community forum](https://quickbytes.exchange/community)
- Contact us through [quickbytes.exchange](https://quickbytes.exchange/contact)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.
