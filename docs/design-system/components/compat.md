# compat

Compound Radix and Tailwind adapters over shared controls/tokens.

States: controlled, disabled, keyboard, hidden Surface.

Runnable composition: [example](../../../examples/catalog/CompatExamples.tsx).

Generated from TypeScript exports; edit implementation props/JSDoc, then run `npm run docs:generate`. Native React attributes remain available in the online API catalog.

## AlertDialog (chatgpt-desktop-kit/compat/alert-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| children | no | `React.ReactNode` |
| open | no | `boolean \| undefined` |
| defaultOpen | no | `boolean \| undefined` |
| onOpenChange | no | `((open: boolean) => void) \| undefined` |

## AlertDialogAction (chatgpt-desktop-kit/compat/alert-dialog)

[Implementation](../../../src/compat/alert-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AlertDialogCancel (chatgpt-desktop-kit/compat/alert-dialog)

[Implementation](../../../src/compat/alert-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AlertDialogContent (chatgpt-desktop-kit/compat/alert-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |
| onEscapeKeyDown | no | `((event: KeyboardEvent) => void) \| undefined` |
| onFocusOutside | no | `((event: CustomEvent<{ originalEvent: FocusEvent; }>) => void) \| undefined` |
| onOpenAutoFocus | no | `((event: Event) => void) \| undefined` |
| onCloseAutoFocus | no | `((event: Event) => void) \| undefined` |
| forceMount | no | `true \| undefined` |
| size | no | `AppDialogSize \| undefined` |

## AlertDialogDescription (chatgpt-desktop-kit/compat/alert-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AlertDialogFooter (chatgpt-desktop-kit/compat/alert-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## AlertDialogHeader (chatgpt-desktop-kit/compat/alert-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## AlertDialogTitle (chatgpt-desktop-kit/compat/alert-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AlertDialogTrigger (chatgpt-desktop-kit/compat/alert-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AppAlertDialog (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| children | no | `React.ReactNode` |
| open | no | `boolean \| undefined` |
| defaultOpen | no | `boolean \| undefined` |
| onOpenChange | no | `((open: boolean) => void) \| undefined` |

## AppAlertDialogAction (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AppAlertDialogCancel (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AppAlertDialogContent (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |
| onEscapeKeyDown | no | `((event: KeyboardEvent) => void) \| undefined` |
| onFocusOutside | no | `((event: CustomEvent<{ originalEvent: FocusEvent; }>) => void) \| undefined` |
| onOpenAutoFocus | no | `((event: Event) => void) \| undefined` |
| onCloseAutoFocus | no | `((event: Event) => void) \| undefined` |
| forceMount | no | `true \| undefined` |
| size | no | `AppDialogSize \| undefined` |

## AppAlertDialogDescription (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AppAlertDialogFooter (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## AppAlertDialogHeader (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## AppAlertDialogTitle (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AppAlertDialogTrigger (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AppConfirmDialog (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| open | yes | `boolean` |
| onOpenChange | yes | `(open: boolean) => void` |
| title | yes | `React.ReactNode` |
| description | no | `React.ReactNode` |
| confirmLabel | no | `React.ReactNode` |
| cancelLabel | no | `React.ReactNode` |
| destructive | no | `boolean \| undefined` |
| busy | no | `boolean \| undefined` |
| confirmActionId | no | `string \| undefined` |
| cancelActionId | no | `string \| undefined` |
| onConfirm | yes | `() => void \| boolean \| Promise<void \| boolean>` |

## AppDialog (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| children | no | `React.ReactNode` |
| open | no | `boolean \| undefined` |
| defaultOpen | no | `boolean \| undefined` |
| onOpenChange | no | `((open: boolean) => void) \| undefined` |
| modal | no | `boolean \| undefined` |

## AppDialogAction (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| variant | no | `"link" \| "primary" \| "secondary" \| "ghost" \| "default" \| "destructive" \| "outline" \| null \| undefined` |
| size | no | `"icon" \| "sm" \| "default" \| "lg" \| null \| undefined` |
| actionId | no | `string \| undefined` |
| confirmOnEnter | no | `boolean \| undefined` |
| icon | no | `React.ReactNode` |
| iconOnly | no | `boolean \| undefined` |
| badge | no | `React.ReactNode` |
| asChild | no | `boolean \| undefined` |

## AppDialogBody (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## AppDialogCancel (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| variant | no | `"link" \| "primary" \| "secondary" \| "ghost" \| "default" \| "destructive" \| "outline" \| null \| undefined` |
| size | no | `"icon" \| "sm" \| "default" \| "lg" \| null \| undefined` |
| actionId | no | `string \| undefined` |
| confirmOnEnter | no | `boolean \| undefined` |
| icon | no | `React.ReactNode` |
| iconOnly | no | `boolean \| undefined` |
| badge | no | `React.ReactNode` |
| asChild | no | `boolean \| undefined` |

## AppDialogClose (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AppDialogContent (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |
| onEscapeKeyDown | no | `((event: KeyboardEvent) => void) \| undefined` |
| onPointerDownOutside | no | `((event: CustomEvent<{ originalEvent: PointerEvent; }>) => void) \| undefined` |
| onFocusOutside | no | `((event: CustomEvent<{ originalEvent: FocusEvent; }>) => void) \| undefined` |
| onInteractOutside | no | `((event: CustomEvent<{ originalEvent: PointerEvent; }> \| CustomEvent<{ originalEvent: FocusEvent; }>) => void) \| undefined` |
| onOpenAutoFocus | no | `((event: Event) => void) \| undefined` |
| onCloseAutoFocus | no | `((event: Event) => void) \| undefined` |
| forceMount | no | `true \| undefined` |
| size | no | `AppDialogSize \| undefined` |
| showCloseButton | no | `boolean \| undefined` |
| closeActionId | no | `string \| undefined` |
| closeDisabled | no | `boolean \| undefined` |
| manualLayout | no | `boolean \| undefined` |

## AppDialogDescription (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AppDialogFooter (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## AppDialogHeader (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## AppDialogOverlay (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| forceMount | no | `true \| undefined` |
| asChild | no | `boolean \| undefined` |

## AppDialogPortal (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| children | no | `React.ReactNode` |
| container | no | `Element \| DocumentFragment \| null \| undefined` |
| forceMount | no | `true \| undefined` |

## AppDialogTitle (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AppDialogTrigger (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## Dialog (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| children | no | `React.ReactNode` |
| open | no | `boolean \| undefined` |
| defaultOpen | no | `boolean \| undefined` |
| onOpenChange | no | `((open: boolean) => void) \| undefined` |
| modal | no | `boolean \| undefined` |

## DialogBody (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## DialogCancel (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| variant | no | `"link" \| "primary" \| "secondary" \| "ghost" \| "default" \| "destructive" \| "outline" \| null \| undefined` |
| size | no | `"icon" \| "sm" \| "default" \| "lg" \| null \| undefined` |
| actionId | no | `string \| undefined` |
| confirmOnEnter | no | `boolean \| undefined` |
| icon | no | `React.ReactNode` |
| iconOnly | no | `boolean \| undefined` |
| badge | no | `React.ReactNode` |
| asChild | no | `boolean \| undefined` |

## DialogClose (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## DialogContent (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |
| onEscapeKeyDown | no | `((event: KeyboardEvent) => void) \| undefined` |
| onPointerDownOutside | no | `((event: CustomEvent<{ originalEvent: PointerEvent; }>) => void) \| undefined` |
| onFocusOutside | no | `((event: CustomEvent<{ originalEvent: FocusEvent; }>) => void) \| undefined` |
| onInteractOutside | no | `((event: CustomEvent<{ originalEvent: PointerEvent; }> \| CustomEvent<{ originalEvent: FocusEvent; }>) => void) \| undefined` |
| onOpenAutoFocus | no | `((event: Event) => void) \| undefined` |
| onCloseAutoFocus | no | `((event: Event) => void) \| undefined` |
| forceMount | no | `true \| undefined` |
| size | no | `AppDialogSize \| undefined` |
| showCloseButton | no | `boolean \| undefined` |
| closeActionId | no | `string \| undefined` |
| closeDisabled | no | `boolean \| undefined` |
| manualLayout | no | `boolean \| undefined` |

## DialogDescription (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## DialogFooter (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## DialogHeader (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## DialogOverlay (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| forceMount | no | `true \| undefined` |
| asChild | no | `boolean \| undefined` |

## DialogPortal (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| children | no | `React.ReactNode` |
| container | no | `Element \| DocumentFragment \| null \| undefined` |
| forceMount | no | `true \| undefined` |

## DialogTitle (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## DialogTrigger (chatgpt-desktop-kit/compat/app-dialog)

[Implementation](../../../src/compat/app-dialog.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## Avatar (chatgpt-desktop-kit/compat/avatar)

[Implementation](../../../src/compat/avatar.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## AvatarFallback (chatgpt-desktop-kit/compat/avatar)

[Implementation](../../../src/compat/avatar.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| delayMs | no | `number \| undefined` |
| asChild | no | `boolean \| undefined` |

## AvatarImage (chatgpt-desktop-kit/compat/avatar)

[Implementation](../../../src/compat/avatar.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| onLoadingStatusChange | no | `((status: "loading" \| "idle" \| "loaded" \| "error") => void) \| undefined` |
| asChild | no | `boolean \| undefined` |

## Badge (chatgpt-desktop-kit/compat/badge)

[Implementation](../../../src/compat/badge.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| variant | no | `"secondary" \| "default" \| "destructive" \| "outline" \| null \| undefined` |
| asChild | no | `boolean \| undefined` |

## Button (chatgpt-desktop-kit/compat/button)

[Implementation](../../../src/compat/button.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| variant | no | `"link" \| "primary" \| "secondary" \| "ghost" \| "default" \| "destructive" \| "outline" \| null \| undefined` |
| size | no | `"icon" \| "sm" \| "default" \| "lg" \| null \| undefined` |
| asChild | no | `boolean \| undefined` |
| actionId | no | `string \| undefined` |
| confirmOnEnter | no | `boolean \| undefined` |
| icon | no | `React.ReactNode` |
| iconOnly | no | `boolean \| undefined` |
| badge | no | `React.ReactNode` |

## Calendar (chatgpt-desktop-kit/compat/calendar)

[Implementation](../../../src/compat/calendar.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| mode | no | `"range" \| "multiple" \| "default" \| "single" \| undefined` |
| className | no | `string \| undefined` |
| classNames | no | `Partial<StyledElement<string>> \| undefined` |
| modifiersClassNames | no | `ModifiersClassNames \| undefined` |
| style | no | `React.CSSProperties \| undefined` |
| styles | no | `Partial<Omit<StyledElement<React.CSSProperties>, InternalModifiersElement>> \| undefined` |
| modifiersStyles | no | `ModifiersStyles \| undefined` |
| id | no | `string \| undefined` |
| defaultMonth | no | `Date \| undefined` |
| month | no | `Date \| undefined` |
| onMonthChange | no | `MonthChangeEventHandler \| undefined` |
| numberOfMonths | no | `number \| undefined` |
| fromDate | no | `Date \| undefined` |
| toDate | no | `Date \| undefined` |
| fromMonth | no | `Date \| undefined` |
| toMonth | no | `Date \| undefined` |
| fromYear | no | `number \| undefined` |
| toYear | no | `number \| undefined` |
| disableNavigation | no | `boolean \| undefined` |
| pagedNavigation | no | `boolean \| undefined` |
| reverseMonths | no | `boolean \| undefined` |
| captionLayout | no | `CaptionLayout \| undefined` |
| fixedWeeks | no | `boolean \| undefined` |
| hideHead | no | `boolean \| undefined` |
| showOutsideDays | no | `boolean \| undefined` |
| showWeekNumber | no | `boolean \| undefined` |
| weekStartsOn | no | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| undefined` |
| firstWeekContainsDate | no | `1 \| 4 \| undefined` |
| ISOWeek | no | `boolean \| undefined` |
| components | no | `CustomComponents \| undefined` |
| footer | no | `React.ReactNode` |
| initialFocus | no | `boolean \| undefined` |
| disabled | no | `Matcher \| Matcher[] \| undefined` |
| hidden | no | `Matcher \| Matcher[] \| undefined` |
| selected | no | `Matcher \| Matcher[] \| undefined` |
| today | no | `Date \| undefined` |
| modifiers | no | `DayModifiers \| undefined` |
| locale | no | `Locale \| undefined` |
| labels | no | `Partial<Labels> \| undefined` |
| formatters | no | `Partial<Formatters> \| undefined` |
| dir | no | `string \| undefined` |
| nonce | no | `string \| undefined` |
| title | no | `string \| undefined` |
| lang | no | `string \| undefined` |
| onNextClick | no | `MonthChangeEventHandler \| undefined` |
| onPrevClick | no | `MonthChangeEventHandler \| undefined` |
| onWeekNumberClick | no | `WeekNumberClickEventHandler \| undefined` |
| onDayClick | no | `DayClickEventHandler \| undefined` |
| onDayFocus | no | `DayFocusEventHandler \| undefined` |
| onDayBlur | no | `DayFocusEventHandler \| undefined` |
| onDayMouseEnter | no | `DayMouseEventHandler \| undefined` |
| onDayMouseLeave | no | `DayMouseEventHandler \| undefined` |
| onDayKeyDown | no | `DayKeyboardEventHandler \| undefined` |
| onDayKeyUp | no | `DayKeyboardEventHandler \| undefined` |
| onDayKeyPress | no | `DayKeyboardEventHandler \| undefined` |
| onDayPointerEnter | no | `DayPointerEventHandler \| undefined` |
| onDayPointerLeave | no | `DayPointerEventHandler \| undefined` |
| onDayTouchCancel | no | `DayTouchEventHandler \| undefined` |
| onDayTouchEnd | no | `DayTouchEventHandler \| undefined` |
| onDayTouchMove | no | `DayTouchEventHandler \| undefined` |
| onDayTouchStart | no | `DayTouchEventHandler \| undefined` |

## Card (chatgpt-desktop-kit/compat/card)

[Implementation](../../../src/compat/card.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## CardAction (chatgpt-desktop-kit/compat/card)

[Implementation](../../../src/compat/card.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## CardContent (chatgpt-desktop-kit/compat/card)

[Implementation](../../../src/compat/card.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## CardDescription (chatgpt-desktop-kit/compat/card)

[Implementation](../../../src/compat/card.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## CardFooter (chatgpt-desktop-kit/compat/card)

[Implementation](../../../src/compat/card.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## CardHeader (chatgpt-desktop-kit/compat/card)

[Implementation](../../../src/compat/card.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## CardTitle (chatgpt-desktop-kit/compat/card)

[Implementation](../../../src/compat/card.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## Checkbox (chatgpt-desktop-kit/compat/checkbox)

[Implementation](../../../src/compat/checkbox.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| checked | no | `CheckboxPrimitive.CheckedState \| undefined` |
| defaultChecked | no | `CheckboxPrimitive.CheckedState \| undefined` |
| required | no | `boolean \| undefined` |
| onCheckedChange | no | `((checked: CheckboxPrimitive.CheckedState) => void) \| undefined` |
| asChild | no | `boolean \| undefined` |

## DatePicker (chatgpt-desktop-kit/compat/date-picker)

[Implementation](../../../src/compat/date-picker.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| value | yes | `Date \| undefined` |
| onChange | yes | `(date: Date \| undefined) => void` |
| placeholder | no | `string \| undefined` |
| className | no | `string \| undefined` |
| triggerClassName | no | `string \| undefined` |

## DropdownMenu (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| children | no | `React.ReactNode` |
| dir | no | `("ltr" \| "rtl") \| undefined` |
| open | no | `boolean \| undefined` |
| defaultOpen | no | `boolean \| undefined` |
| onOpenChange | no | `((open: boolean) => void) \| undefined` |
| modal | no | `boolean \| undefined` |

## DropdownMenuCheckboxItem (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| onSelect | no | `((event: Event) => void) \| undefined` |
| disabled | no | `boolean \| undefined` |
| checked | no | `(boolean \| "indeterminate") \| undefined` |
| asChild | no | `boolean \| undefined` |
| textValue | no | `string \| undefined` |
| onCheckedChange | no | `((checked: boolean) => void) \| undefined` |

## DropdownMenuContent (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |
| onEscapeKeyDown | no | `((event: KeyboardEvent) => void) \| undefined` |
| onPointerDownOutside | no | `((event: CustomEvent<{ originalEvent: PointerEvent; }>) => void) \| undefined` |
| onFocusOutside | no | `((event: CustomEvent<{ originalEvent: FocusEvent; }>) => void) \| undefined` |
| onInteractOutside | no | `((event: CustomEvent<{ originalEvent: PointerEvent; }> \| CustomEvent<{ originalEvent: FocusEvent; }>) => void) \| undefined` |
| onCloseAutoFocus | no | `((event: Event) => void) \| undefined` |
| forceMount | no | `true \| undefined` |
| align | no | `"center" \| "start" \| "end" \| undefined` |
| loop | no | `boolean \| undefined` |
| side | no | `"right" \| "bottom" \| "top" \| "left" \| undefined` |
| sideOffset | no | `number \| undefined` |
| alignOffset | no | `number \| undefined` |
| arrowPadding | no | `number \| undefined` |
| avoidCollisions | no | `boolean \| undefined` |
| collisionBoundary | no | `(Element \| null) \| (Element \| null)[] \| undefined` |
| collisionPadding | no | `number \| Partial<Record<"right" \| "bottom" \| "top" \| "left", number>> \| undefined` |
| sticky | no | `"partial" \| "always" \| undefined` |
| hideWhenDetached | no | `boolean \| undefined` |
| updatePositionStrategy | no | `"always" \| "optimized" \| undefined` |

## DropdownMenuGroup (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## DropdownMenuItem (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| onSelect | no | `((event: Event) => void) \| undefined` |
| disabled | no | `boolean \| undefined` |
| asChild | no | `boolean \| undefined` |
| textValue | no | `string \| undefined` |
| inset | no | `boolean \| undefined` |
| icon | no | `React.ReactNode` |
| actionId | no | `string \| undefined` |

## DropdownMenuLabel (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |
| inset | no | `boolean \| undefined` |

## DropdownMenuPortal (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| children | no | `React.ReactNode` |
| container | no | `Element \| DocumentFragment \| null \| undefined` |
| forceMount | no | `true \| undefined` |

## DropdownMenuRadioGroup (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| value | no | `string \| undefined` |
| onValueChange | no | `((value: string) => void) \| undefined` |
| asChild | no | `boolean \| undefined` |

## DropdownMenuRadioItem (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| onSelect | no | `((event: Event) => void) \| undefined` |
| disabled | no | `boolean \| undefined` |
| value | yes | `string` |
| asChild | no | `boolean \| undefined` |
| textValue | no | `string \| undefined` |

## DropdownMenuSeparator (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## DropdownMenuShortcut (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## DropdownMenuSub (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| children | no | `React.ReactNode` |
| open | no | `boolean \| undefined` |
| defaultOpen | no | `boolean \| undefined` |
| onOpenChange | no | `((open: boolean) => void) \| undefined` |

## DropdownMenuSubContent (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |
| onEscapeKeyDown | no | `((event: KeyboardEvent) => void) \| undefined` |
| onPointerDownOutside | no | `((event: CustomEvent<{ originalEvent: PointerEvent; }>) => void) \| undefined` |
| onFocusOutside | no | `((event: CustomEvent<{ originalEvent: FocusEvent; }>) => void) \| undefined` |
| onInteractOutside | no | `((event: CustomEvent<{ originalEvent: PointerEvent; }> \| CustomEvent<{ originalEvent: FocusEvent; }>) => void) \| undefined` |
| forceMount | no | `true \| undefined` |
| loop | no | `boolean \| undefined` |
| sideOffset | no | `number \| undefined` |
| alignOffset | no | `number \| undefined` |
| arrowPadding | no | `number \| undefined` |
| avoidCollisions | no | `boolean \| undefined` |
| collisionBoundary | no | `(Element \| null) \| (Element \| null)[] \| undefined` |
| collisionPadding | no | `number \| Partial<Record<"right" \| "bottom" \| "top" \| "left", number>> \| undefined` |
| sticky | no | `"partial" \| "always" \| undefined` |
| hideWhenDetached | no | `boolean \| undefined` |
| updatePositionStrategy | no | `"always" \| "optimized" \| undefined` |

## DropdownMenuSubTrigger (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| disabled | no | `boolean \| undefined` |
| asChild | no | `boolean \| undefined` |
| textValue | no | `string \| undefined` |
| inset | no | `boolean \| undefined` |

## DropdownMenuTrigger (chatgpt-desktop-kit/compat/dropdown-menu)

[Implementation](../../../src/compat/dropdown-menu.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## GlassIconButton (chatgpt-desktop-kit/compat/glass)

[Implementation](../../../src/compat/glass.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| actionId | no | `string \| undefined` |
| confirmOnEnter | no | `boolean \| undefined` |
| icon | no | `React.ReactNode` |
| iconOnly | no | `boolean \| undefined` |
| badge | no | `React.ReactNode` |
| asChild | no | `boolean \| undefined` |
| tone | no | `"primary" \| "neutral" \| "warning" \| null \| undefined` |

## GlassPage (chatgpt-desktop-kit/compat/glass)

[Implementation](../../../src/compat/glass.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| showOrbs | no | `boolean \| undefined` |

## GlassPanel (chatgpt-desktop-kit/compat/glass)

[Implementation](../../../src/compat/glass.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## GlassSection (chatgpt-desktop-kit/compat/glass)

[Implementation](../../../src/compat/glass.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## GlassToolbar (chatgpt-desktop-kit/compat/glass)

[Implementation](../../../src/compat/glass.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## Input (chatgpt-desktop-kit/compat/input)

[Implementation](../../../src/compat/input.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## InternalScrollArea (chatgpt-desktop-kit/compat/internal-scroll-area)

[Implementation](../../../src/compat/internal-scroll-area.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## Label (chatgpt-desktop-kit/compat/label)

[Implementation](../../../src/compat/label.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## LoadingSpinner (chatgpt-desktop-kit/compat/loading-spinner)

[Implementation](../../../src/compat/loading-spinner.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| message | no | `string \| undefined` |
| size | no | `"sm" \| "md" \| "lg" \| undefined` |
| className | no | `string \| undefined` |

## Popover (chatgpt-desktop-kit/compat/popover)

[Implementation](../../../src/compat/popover.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| children | no | `React.ReactNode` |
| open | no | `boolean \| undefined` |
| defaultOpen | no | `boolean \| undefined` |
| onOpenChange | no | `((open: boolean) => void) \| undefined` |
| modal | no | `boolean \| undefined` |

## PopoverAnchor (chatgpt-desktop-kit/compat/popover)

[Implementation](../../../src/compat/popover.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |
| virtualRef | no | `React.RefObject<Measurable> \| undefined` |

## PopoverContent (chatgpt-desktop-kit/compat/popover)

[Implementation](../../../src/compat/popover.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |
| onEscapeKeyDown | no | `((event: KeyboardEvent) => void) \| undefined` |
| onPointerDownOutside | no | `((event: CustomEvent<{ originalEvent: PointerEvent; }>) => void) \| undefined` |
| onFocusOutside | no | `((event: CustomEvent<{ originalEvent: FocusEvent; }>) => void) \| undefined` |
| onInteractOutside | no | `((event: CustomEvent<{ originalEvent: PointerEvent; }> \| CustomEvent<{ originalEvent: FocusEvent; }>) => void) \| undefined` |
| onOpenAutoFocus | no | `((event: Event) => void) \| undefined` |
| onCloseAutoFocus | no | `((event: Event) => void) \| undefined` |
| forceMount | no | `true \| undefined` |
| align | no | `"center" \| "start" \| "end" \| undefined` |
| side | no | `"right" \| "bottom" \| "top" \| "left" \| undefined` |
| sideOffset | no | `number \| undefined` |
| alignOffset | no | `number \| undefined` |
| arrowPadding | no | `number \| undefined` |
| avoidCollisions | no | `boolean \| undefined` |
| collisionBoundary | no | `(Element \| null) \| (Element \| null)[] \| undefined` |
| collisionPadding | no | `number \| Partial<Record<"right" \| "bottom" \| "top" \| "left", number>> \| undefined` |
| sticky | no | `"partial" \| "always" \| undefined` |
| hideWhenDetached | no | `boolean \| undefined` |
| updatePositionStrategy | no | `"always" \| "optimized" \| undefined` |

## PopoverTrigger (chatgpt-desktop-kit/compat/popover)

[Implementation](../../../src/compat/popover.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## Progress (chatgpt-desktop-kit/compat/progress)

[Implementation](../../../src/compat/progress.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| value | no | `number \| null \| undefined` |
| max | no | `number \| undefined` |
| getValueLabel | no | `((value: number, max: number) => string) \| undefined` |
| asChild | no | `boolean \| undefined` |

## SegmentedControl (chatgpt-desktop-kit/compat/segmented-control)

[Implementation](../../../src/compat/segmented-control.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| value | yes | `T` |
| items | yes | `readonly SegmentedControlItem<T>[]` |
| onValueChange | yes | `(value: T) => void` |
| ariaLabel | yes | `string` |
| appearance | no | `"surface" \| "underline" \| undefined` |
| disabled | no | `boolean \| undefined` |
| className | no | `string \| undefined` |
| actionId | no | `string \| undefined` |

## Select (chatgpt-desktop-kit/compat/select)

[Implementation](../../../src/compat/select.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| children | no | `React.ReactNode` |
| value | no | `string \| undefined` |
| defaultValue | no | `string \| undefined` |
| onValueChange | no | `((value: string) => void) \| undefined` |
| open | no | `boolean \| undefined` |
| defaultOpen | no | `boolean \| undefined` |
| onOpenChange | no | `((open: boolean) => void) \| undefined` |
| dir | no | `("ltr" \| "rtl") \| undefined` |
| name | no | `string \| undefined` |
| autoComplete | no | `string \| undefined` |
| disabled | no | `boolean \| undefined` |
| required | no | `boolean \| undefined` |
| form | no | `string \| undefined` |

## SelectContent (chatgpt-desktop-kit/compat/select)

[Implementation](../../../src/compat/select.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |
| onEscapeKeyDown | no | `((event: KeyboardEvent) => void) \| undefined` |
| onPointerDownOutside | no | `((event: CustomEvent<{ originalEvent: PointerEvent; }>) => void) \| undefined` |
| onCloseAutoFocus | no | `((event: Event) => void) \| undefined` |
| align | no | `"center" \| "start" \| "end" \| undefined` |
| side | no | `"right" \| "bottom" \| "top" \| "left" \| undefined` |
| sideOffset | no | `number \| undefined` |
| alignOffset | no | `number \| undefined` |
| arrowPadding | no | `number \| undefined` |
| avoidCollisions | no | `boolean \| undefined` |
| collisionBoundary | no | `(Element \| null) \| (Element \| null)[] \| undefined` |
| collisionPadding | no | `number \| Partial<Record<"right" \| "bottom" \| "top" \| "left", number>> \| undefined` |
| sticky | no | `"partial" \| "always" \| undefined` |
| hideWhenDetached | no | `boolean \| undefined` |
| updatePositionStrategy | no | `"always" \| "optimized" \| undefined` |
| position | no | `"item-aligned" \| "popper" \| undefined` |

## SelectControl (chatgpt-desktop-kit/compat/select)

[Implementation](../../../src/compat/select.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| options | yes | `readonly SelectControlOption[]` |
| value | no | `string \| undefined` |
| defaultValue | no | `string \| undefined` |
| onValueChange | no | `((value: string) => void) \| undefined` |
| placeholder | no | `React.ReactNode` |
| className | no | `string \| undefined` |
| contentClassName | no | `string \| undefined` |
| disabled | no | `boolean \| undefined` |
| name | no | `string \| undefined` |
| required | no | `boolean \| undefined` |
| id | no | `string \| undefined` |
| title | no | `string \| undefined` |
| aria-label | no | `string \| undefined` |
| aria-labelledby | no | `string \| undefined` |
| actionId | no | `string \| undefined` |
| featureId | no | `string \| undefined` |
| surfaceId | no | `string \| undefined` |

## SelectGroup (chatgpt-desktop-kit/compat/select)

[Implementation](../../../src/compat/select.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## SelectItem (chatgpt-desktop-kit/compat/select)

[Implementation](../../../src/compat/select.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| disabled | no | `boolean \| undefined` |
| value | yes | `string` |
| asChild | no | `boolean \| undefined` |
| textValue | no | `string \| undefined` |

## SelectLabel (chatgpt-desktop-kit/compat/select)

[Implementation](../../../src/compat/select.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## SelectScrollDownButton (chatgpt-desktop-kit/compat/select)

[Implementation](../../../src/compat/select.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## SelectScrollUpButton (chatgpt-desktop-kit/compat/select)

[Implementation](../../../src/compat/select.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## SelectSeparator (chatgpt-desktop-kit/compat/select)

[Implementation](../../../src/compat/select.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## SelectTrigger (chatgpt-desktop-kit/compat/select)

[Implementation](../../../src/compat/select.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| asChild | no | `boolean \| undefined` |

## SelectValue (chatgpt-desktop-kit/compat/select)

[Implementation](../../../src/compat/select.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| placeholder | no | `React.ReactNode` |
| asChild | no | `boolean \| undefined` |

## Separator (chatgpt-desktop-kit/compat/separator)

[Implementation](../../../src/compat/separator.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| orientation | no | `"horizontal" \| "vertical" \| undefined` |
| decorative | no | `boolean \| undefined` |
| asChild | no | `boolean \| undefined` |

## Skeleton (chatgpt-desktop-kit/compat/skeleton)

[Implementation](../../../src/compat/skeleton.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## Switch (chatgpt-desktop-kit/compat/switch)

[Implementation](../../../src/compat/switch.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| defaultChecked | no | `boolean \| undefined` |
| checked | no | `boolean \| undefined` |
| required | no | `boolean \| undefined` |
| asChild | no | `boolean \| undefined` |
| onCheckedChange | no | `((checked: boolean) => void) \| undefined` |

## Textarea (chatgpt-desktop-kit/compat/textarea)

[Implementation](../../../src/compat/textarea.tsx)

| Prop | Required | Type |
| --- | --- | --- |

## Tooltip (chatgpt-desktop-kit/compat/tooltip)

[Implementation](../../../src/compat/tooltip.tsx)

| Prop | Required | Type |
| --- | --- | --- |
| label | yes | `string` |
| children | yes | `ReactElement<any, string \| JSXElementConstructor<any>>` |

## VirtualList (chatgpt-desktop-kit/compat/virtual-list)

[Implementation](../../../src/compat/virtual-list.tsx)

Standard internal long-list surface. It owns viewport scrolling, row
virtualization, dynamic measurement, overscan, and the shared scrollbar skin.

| Prop | Required | Type |
| --- | --- | --- |
| items | yes | `readonly T[]` |
| getItemKey | yes | `(item: T, index: number) => string \| number` |
| renderItem | yes | `(item: T, index: number) => ReactNode` |
| estimateSize | yes | `number \| ((item: T, index: number) => number)` |
| ariaLabel | yes | `string` |
| resetKey | no | `unknown` |
| overscan | no | `number \| undefined` |
| className | no | `string \| undefined` |
| contentClassName | no | `string \| undefined` |
| itemClassName | no | `string \| ((item: T, index: number) => string \| undefined) \| undefined` |
| role | no | `"list" \| "listbox" \| undefined` |
| style | no | `CSSProperties \| undefined` |
| apiRef | no | `Ref<VirtualListHandle> \| undefined` |
