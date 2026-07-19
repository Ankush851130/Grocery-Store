const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    line1: {
      type: String,
      required: true,
      trim: true,
    },
    line2: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    landmark: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      default: '1 pc',
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [
        (value) => Array.isArray(value) && value.length > 0,
        'Order must contain at least one item',
      ],
    },
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'razorpay'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentResult: {
      provider: {
        type: String,
        default: 'razorpay',
      },
      razorpayOrderId: {
        type: String,
        default: '',
      },
      razorpayPaymentId: {
        type: String,
        default: '',
      },
      razorpaySignature: {
        type: String,
        default: '',
      },
      paidAt: {
        type: Date,
      },
    },
    pricing: {
      itemsTotal: {
        type: Number,
        required: true,
        min: 0,
      },
      couponCode: {
        type: String,
        default: '',
      },
      couponLabel: {
        type: String,
        default: '',
      },
      couponDiscount: {
        type: Number,
        default: 0,
        min: 0,
      },
      shippingFee: {
        type: Number,
        default: 0,
        min: 0,
      },
      taxAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
      grandTotal: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    tracking: {
      currentStatus: {
        type: String,
        default: 'pending',
      },
      updates: [
        {
          status: {
            type: String,
            required: true,
          },
          message: {
            type: String,
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    invoice: {
      invoiceNumber: {
        type: String,
        unique: true,
        sparse: true,
      },
      issuedAt: {
        type: Date,
      },
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    cancelReason: {
      type: String,
      default: '',
      trim: true,
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.pre('save', function setOrderIdentifiers(next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  if (!this.invoice?.invoiceNumber) {
    this.invoice = this.invoice || {};
    this.invoice.invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    this.invoice.issuedAt = this.invoice.issuedAt || new Date();
  }

  if (!this.tracking?.updates?.length) {
    this.tracking = this.tracking || {};
    this.tracking.currentStatus = this.status;
    this.tracking.updates = [
      {
        status: this.status,
        message: 'Order placed successfully',
        createdAt: new Date(),
      },
    ];
  }

  next();
});

orderSchema.set('toJSON', {
  virtuals: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
