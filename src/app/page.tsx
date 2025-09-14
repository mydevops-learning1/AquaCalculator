"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { FLATS, type FlatName } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Droplets, CircleDollarSign, ReceiptText, Save, TrendingUp, RefreshCcw, Calendar, History, LogOut, CloudUpload, CloudDownload, User as UserIcon } from "lucide-react";

const initialReadings = FLATS.reduce(
  (acc, flat) => ({ ...acc, [flat]: 0 }),
  {} as Record<FlatName, number>
);

type MonthlyReading = {
  previousReadings: Record<FlatName, number>;
  currentReadings: Record<FlatName, number>;
  totalBill: number;
};

type HistoryData = Record<string, MonthlyReading>;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AquaCalcPage() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  
  const [history, setHistory] = useLocalStorage<HistoryData>(
    "aqua-calc-history",
    {}
  );
  
  const [currentReadings, setCurrentReadings] = useState<Record<FlatName, number>>(initialReadings);
  const [previousReadings, setPreviousReadings] = useState<Record<FlatName, number>>(initialReadings);
  const [totalBill, setTotalBill] = useState<number>(0);

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth());

  const selectedPeriodKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  useEffect(() => {
    const savedData = history[selectedPeriodKey];
    if (savedData) {
      setPreviousReadings(savedData.previousReadings);
      setCurrentReadings(savedData.currentReadings);
      setTotalBill(savedData.totalBill);
    } else {
      const lastMonth = new Date(year, month - 1);
      const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
      const lastMonthData = history[lastMonthKey];
      if (lastMonthData) {
        setPreviousReadings(lastMonthData.currentReadings);
        // Reset current readings for the new month
        setCurrentReadings(initialReadings);
      } else {
        setPreviousReadings(initialReadings);
        setCurrentReadings(initialReadings);
      }
      setTotalBill(0);
    }
  }, [year, month, history]);


  const calculations = useMemo(() => {
    const consumptionData = FLATS.map((flat) => {
      const prev = Number(previousReadings[flat] || 0);
      const curr = Number(currentReadings[flat] || 0);
      const consumption = curr >= prev ? curr - prev : 0;
      return { flat, consumption };
    });

    const totalConsumption = consumptionData.reduce((sum, data) => sum + data.consumption, 0);
    const costPerLitre = totalConsumption > 0 ? totalBill / totalConsumption : 0;

    const billingData = consumptionData.map((data) => ({
      ...data,
      bill: data.consumption * costPerLitre,
    }));

    return { totalConsumption, costPerLitre, billingData };
  }, [currentReadings, previousReadings, totalBill]);

  const handlePreviousReadingChange = (flat: FlatName, value: string) => {
    setPreviousReadings((prev) => ({
      ...prev,
      [flat]: value === "" ? 0 : parseInt(value, 10),
    }));
  };

  const handleCurrentReadingChange = (flat: FlatName, value: string) => {
    setCurrentReadings((prev) => ({
      ...prev,
      [flat]: value === "" ? 0 : parseInt(value, 10),
    }));
  };

  const handleCurrentReadingBlur = (flat: FlatName) => {
    const currentVal = currentReadings[flat] || 0;
    const previousVal = previousReadings[flat] || 0;

    if (currentVal > 0 && currentVal < previousVal) {
      toast({
        title: "Invalid Reading",
        description: `Current reading for ${flat} cannot be less than its previous reading.`,
        variant: "destructive",
      });
    }
  };


  const handleTotalBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTotalBill(value === "" ? 0 : parseFloat(value));
  };
  
  const handleYearChange = (value: string) => {
     setYear(value === "" ? new Date().getFullYear() : parseInt(value, 10));
  }

  const handleMonthChange = (value: string) => {
    setMonth(parseInt(value, 10));
  }

  const handleSaveReadings = () => {
    const newHistory = {
      ...history,
      [selectedPeriodKey]: {
        previousReadings,
        currentReadings,
        totalBill,
      },
    };
    setHistory(newHistory);
    toast({
      title: "Readings Saved",
      description: `Readings for ${MONTHS[month]} ${year} have been saved locally.`,
      variant: "default",
    });
  };
  
  const handleResetCurrent = () => {
    setCurrentReadings(initialReadings);
    setPreviousReadings(initialReadings);
    setTotalBill(0);
    toast({
      title: "Inputs Cleared",
      description: "Current month's readings and total bill have been reset.",
    });
  };
  
  const backupData = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to back up data.", variant: "destructive" });
      return;
    }
    try {
      const userDocRef = doc(db, "userReadings", user.uid);
      await setDoc(userDocRef, { history });
      toast({ title: "Backup Successful", description: "Your readings have been backed up to the cloud." });
    } catch (error) {
      console.error("Error backing up data: ", error);
      toast({ title: "Backup Failed", description: "Could not back up data. Please try again.", variant: "destructive" });
    }
  };

  const restoreData = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to restore data.", variant: "destructive" });
      return;
    }
    try {
      const userDocRef = doc(db, "userReadings", user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const cloudHistory = docSnap.data().history as HistoryData;
        setHistory(cloudHistory);
        toast({ title: "Restore Successful", description: "Your readings have been restored from the cloud." });
      } else {
        toast({ title: "No Backup Found", description: "No cloud backup was found for your account.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error restoring data: ", error);
      toast({ title: "Restore Failed", description: "Could not restore data. Please try again.", variant: "destructive" });
    }
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const sortedHistoryKeys = Object.keys(history).sort().reverse();
  
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <>
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-2">
                    <Droplets className="w-8 h-8 text-primary" />
                    <h1 className="font-headline text-2xl font-bold tracking-tight text-primary">
                        AquaCalc
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
                                    <AvatarFallback>
                                        <UserIcon/>
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={backupData}>
                                <CloudUpload className="mr-2 h-4 w-4" />
                                <span>Backup to Cloud</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={restoreData}>
                                <CloudDownload className="mr-2 h-4 w-4" />
                                <span>Restore from Cloud</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    </header>
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Select Billing Period
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month-select">Month</Label>
               <Select value={String(month)} onValueChange={handleMonthChange}>
                <SelectTrigger id="month-select">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year-select">Year</Label>
              <Select value={String(year)} onValueChange={handleYearChange}>
                <SelectTrigger id="year-select">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="w-6 h-6" />
              Meter Readings &amp; Total Bill for {MONTHS[month]} {year}
            </CardTitle>
            <CardDescription>
              Enter the meter readings for each flat and the total water bill.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="total-bill" className="text-base font-semibold">Total Monthly Bill (INR)</Label>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="total-bill"
                  type="number"
                  placeholder="e.g., 5000"
                  value={totalBill || ""}
                  onChange={handleTotalBillChange}
                  className="pl-10 text-lg h-12"
                />
              </div>
            </div>
            <div className="space-y-4">
              {FLATS.map((flat) => (
                <div key={flat} className="space-y-2 p-4 border rounded-lg">
                  <Label className="font-semibold text-base">{flat}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor={`${flat}-prev`}>Previous Reading (L)</Label>
                      <Input
                        id={`${flat}-prev`}
                        type="number"
                        placeholder="e.g., 10000"
                        value={previousReadings[flat] || ""}
                        onChange={(e) => handlePreviousReadingChange(flat, e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`${flat}-curr`}>Current Reading (L)</Label>
                      <Input
                        id={`${flat}-curr`}
                        type="number"
                        placeholder="e.g., 11000"
                        value={currentReadings[flat] || ""}
                        onChange={(e) => handleCurrentReadingChange(flat, e.target.value)}
                        onBlur={() => handleCurrentReadingBlur(flat)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
           <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleResetCurrent}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Clear Inputs
            </Button>
            <Button onClick={handleSaveReadings}>
              <Save className="mr-2 h-4 w-4" />
              Save Readings
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Billing Summary
            </CardTitle>
            <CardDescription>
              A breakdown of water consumption and costs for {MONTHS[month]} {year}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><Droplets/>Total Consumption</p>
                <p className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('en-IN').format(calculations.totalConsumption)} L
                </p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><CircleDollarSign/>Cost per Litre</p>
                <p className="text-2xl font-bold text-accent">
                  {formatCurrency(calculations.costPerLitre)}
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Flat</TableHead>
                    <TableHead className="text-right font-semibold">Consumption (L)</TableHead>
                    <TableHead className="text-right font-semibold">Amount to Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.billingData.map(({ flat, consumption, bill }) => (
                    <TableRow key={flat} className="transition-colors hover:bg-secondary/50">
                      <TableCell className="font-medium">{flat}</TableCell>
                      <TableCell className="text-right tabular-nums">{new Intl.NumberFormat('en-IN').format(consumption)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-accent">{formatCurrency(bill)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {sortedHistoryKeys.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-6 h-6" />
                Readings History
              </CardTitle>
              <CardDescription>
                View saved readings from previous months.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {sortedHistoryKeys.map((key) => {
                  const [histYear, histMonthNum] = key.split('-').map(Number);
                  const histMonth = MONTHS[histMonthNum - 1];
                  const histData = history[key];
                  if (!histData) return null;
                  const histTotalConsumption = FLATS.reduce((sum, flat) => {
                    const prev = histData.previousReadings[flat] || 0;
                    const curr = histData.currentReadings[flat] || 0;
                    return sum + (curr > prev ? curr - prev : 0);
                  }, 0);
                  const histCostPerLitre = histTotalConsumption > 0 ? histData.totalBill / histTotalConsumption : 0;
                  
                  return (
                  <AccordionItem value={key} key={key}>
                    <AccordionTrigger>{histMonth} {histYear}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="text-sm">
                          <strong>Total Bill:</strong> {formatCurrency(histData.totalBill)} | <strong>Total Consumption:</strong> {new Intl.NumberFormat('en-IN').format(histTotalConsumption)} L | <strong>Cost/L:</strong> {formatCurrency(histCostPerLitre)}
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Flat</TableHead>
                              <TableHead className="text-right">Previous</TableHead>
                              <TableHead className="text-right">Current</TableHead>
                              <TableHead className="text-right">Consumption</TableHead>
                              <TableHead className="text-right">Bill</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {FLATS.map(flat => {
                               const prev = histData.previousReadings[flat] || 0;
                               const curr = histData.currentReadings[flat] || 0;
                               const consumption = curr > prev ? curr - prev : 0;
                               const bill = consumption * histCostPerLitre;
                               return (
                                <TableRow key={flat}>
                                  <TableCell className="font-medium">{flat}</TableCell>
                                  <TableCell className="text-right">{new Intl.NumberFormat('en-IN').format(prev)}</TableCell>
                                  <TableCell className="text-right">{new Intl.NumberFormat('en-IN').format(curr)}</TableCell>
                                  <TableCell className="text-right">{new Intl.NumberFormat('en-IN').format(consumption)}</TableCell>
                                  <TableCell className="text-right font-semibold">{formatCurrency(bill)}</TableCell>
                                </TableRow>
                               )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )})}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
    </>
  );
}
