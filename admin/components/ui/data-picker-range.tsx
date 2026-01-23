"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format, set } from "date-fns"
import { zhCN as dateFnsZhCN } from 'date-fns/locale'
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { zhCN } from "react-day-picker/locale";

interface DatePickerWithRangeProps {
    className?: string;
    onChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
    initialRange?: DateRange;
}

export function DatePickerWithRange({ className, onChange, initialRange }: DatePickerWithRangeProps) {
    const [date, setDate] = React.useState<DateRange | undefined>(initialRange)

    const handleDateSelect = (newDate: DateRange | undefined) => {
        if (!newDate) {
            setDate(undefined);
            onChange?.({ from: undefined, to: undefined });
            return;
        }

        let from = newDate.from;
        let to = newDate.to;

        // Preserve time if date exists
        if (date?.from && from) {
            from = set(from, {
                hours: date.from.getHours(),
                minutes: date.from.getMinutes(),
                seconds: date.from.getSeconds()
            });
        }

        if (date?.to && to) {
            to = set(to, {
                hours: date.to.getHours(),
                minutes: date.to.getMinutes(),
                seconds: date.to.getSeconds()
            });
        }

        const nextDate = { from, to };
        setDate(nextDate);
        onChange?.(nextDate);
    };

    const handleTimeChange = (type: 'from' | 'to', timeValue: string) => {
        if (!date || !timeValue) return;

        const [hours, minutes] = timeValue.split(':').map(Number);

        let nextDate = { ...date };
        if (type === 'from' && date.from) {
            const newFrom = set(date.from, { hours, minutes });
            nextDate = { ...date, from: newFrom };
        } else if (type === 'to' && date.to) {
            const newTo = set(date.to, { hours, minutes });
            nextDate = { ...date, to: newTo };
        }

        setDate(nextDate);
        onChange?.({ from: nextDate.from, to: nextDate.to });
    }


    return (
        <Field className={`mx-auto w-auto min-w-96 ${className}`}>
            {/* <FieldLabel htmlFor="date-picker-range">Date Picker Range</FieldLabel> */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date-picker-range"
                        className="justify-start px-2.5 font-normal w-full"
                    >
                        <CalendarIcon />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "yyyy年MM月dd日 HH:mm", { locale: dateFnsZhCN })} -{" "}
                                    {format(date.to, "yyyy年MM月dd日 HH:mm", { locale: dateFnsZhCN })}
                                </>
                            ) : (
                                format(date.from, "yyyy年MM月dd日 HH:mm", { locale: dateFnsZhCN })
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={handleDateSelect}
                        locale={zhCN}
                        numberOfMonths={2}
                    />
                    <div className="p-3 border-t border-border flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <Label className="text-xs">Start Time</Label>
                            <Input
                                type="time"
                                value={date?.from ? format(date.from, 'HH:mm', { locale: dateFnsZhCN }) : ''}
                                onChange={(e) => handleTimeChange('from', e.target.value)}
                                disabled={!date?.from}
                                className="h-8"
                            />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <Label className="text-xs">End Time</Label>
                            <Input
                                type="time"
                                value={date?.to ? format(date.to, 'HH:mm', { locale: dateFnsZhCN }) : ''}
                                onChange={(e) => handleTimeChange('to', e.target.value)}
                                disabled={!date?.to}
                                className="h-8"
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </Field>
    )
}
