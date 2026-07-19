import { FaMinus, FaPlus, FaTrashCan } from 'react-icons/fa6';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function CartLineItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <article className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-soft md:grid-cols-[96px_1fr_auto] md:items-center">
      <div className="h-24 w-24 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 via-white to-orange-50">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">{item.brand}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">{item.name}</h3>
          <p className="text-sm text-slate-500">{item.category} · {item.unit}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{currencyFormatter.format(item.displayPrice)}</span>
          {item.hasDiscount ? (
            <span className="text-slate-400 line-through">{currencyFormatter.format(item.price)}</span>
          ) : null}
          {item.stock ? <span>{item.stock} in stock</span> : null}
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 md:items-end">
        <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onDecrease(item.id)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100"
            aria-label={`Decrease quantity for ${item.name}`}
          >
            <FaMinus />
          </button>
          <span className="min-w-12 px-3 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onIncrease(item.id)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100"
            aria-label={`Increase quantity for ${item.name}`}
          >
            <FaPlus />
          </button>
        </div>

        <p className="text-lg font-black text-slate-950">{currencyFormatter.format(item.displayPrice * item.quantity)}</p>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          <FaTrashCan />
          Remove
        </button>
      </div>
    </article>
  );
}

export default CartLineItem;
