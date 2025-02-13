import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="md:container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Support</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Kontakt */}
        <Card>
          <CardHeader>
            <CardTitle>Kontakta oss</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Abbe</h3>
              <p>
                <a
                  href="mailto:abbe@techdevcyber.se"
                  className="text-blue-600 hover:underline"
                >
                  abbe@techdevcyber.se
                </a>
              </p>
              <p>+4693394031</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* <Button
                onClick={() => (window.location.href = "tel:+4693394031")}
                className="w-full sm:w-auto"
              >
                <Phone className="mr-2 h-4 w-4" /> Ring
              </Button> */}
              <Button
                onClick={() =>
                  (window.location.href = "mailto:abbe@techdevcyber.se")
                }
                className="w-full sm:w-auto"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Mejla
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Livechatt */}
        <Card>
          <CardHeader>
            <CardTitle>Livechatt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Använd chattwidgeten nere i högra hörnet för snabb hjälp.
            </p>
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Öppettider</h3>
              <p>Mån-Sön: 08:30 - 22:00</p>
              <p>Vi är här för dig</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Direktkontakt - Full width */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Ring oss direkt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Behöver du snabb hjälp? Använd knapparna nedan för att chatta
              eller ringa oss direkt.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
