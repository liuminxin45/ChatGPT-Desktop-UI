import { t as phdT, useTranslation, useLocale } from '../strings';
import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";

import { cn } from './utils';
import { Button } from './button';
import { Calendar } from './calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  className = "",
  triggerClassName = "",
}: DatePickerProps) {
  const phdT = useTranslation();
  const locale = useLocale();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 px-2 text-xs font-normal justify-start text-left flex-1 min-w-0",
              !value && "text-muted-foreground",
              triggerClassName,
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50 shrink-0" />
            <span className="truncate">
              {value
                ? format(value, "PP", { locale: locale === 'zh-CN' ? zhCN : enUS })
                : placeholder || phdT('选择日期')}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[10200]" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setIsOpen(false);
            }}
            initialFocus
          />
          {value && (
            <div className="p-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  onChange(undefined);
                  setIsOpen(false);
                }}
              >
                <X className="mr-1 h-3 w-3" />
                {phdT("清除日期 ")}</Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onChange(undefined);
          }}
          aria-label={phdT("清除日期")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
