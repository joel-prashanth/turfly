import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";

function DropdownMenu({ items = [], disabled = false, align = "end" }) {
  return (
    <DropdownMenuPrimitive.Root modal={false}>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MoreVertical size={18} />
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          sideOffset={8}
          align={align}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
          className="z-[9999] min-w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl"
        >
          {items.map((item) => (
            <DropdownMenuPrimitive.Item
              key={item.label}
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick?.();
                }
              }}
              className={`
                cursor-pointer select-none px-4 py-2.5 text-sm outline-none
                ${
                  item.danger
                    ? "text-red-600 focus:bg-red-50"
                    : "text-slate-700 focus:bg-slate-50"
                }
                data-[disabled]:pointer-events-none
                data-[disabled]:opacity-50
              `}
            >
              {item.label}
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

export default DropdownMenu;
