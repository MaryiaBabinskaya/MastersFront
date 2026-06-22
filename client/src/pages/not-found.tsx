import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-stone-100 p-4">
            <Card className="w-full max-w-md border-4 border-double border-yellow-600 shadow-xl bg-white">
                <CardContent className="pt-6">
                    <div className="flex mb-4 gap-2">
                        <AlertCircle className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-serif font-bold text-stone-900">
                            Kurtyna opadła...
                        </h1>
                    </div>

                    <p className="mt-4 text-sm text-stone-600 font-serif italic">
                        Niestety, strona której szukasz nie istnieje lub została przeniesiona
                        do archiwum teatralnego.
                    </p>

                    <div className="mt-8 flex justify-center">
                        <Link href="/">
                            <Button className="btn-theater">
                                Powrót na widownię
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}