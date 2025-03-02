
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PackageNotificationRequest {
  neighbor: {
    name: string;
    last_name: string;
    email: string;
  };
  package: {
    id: string;
    type: string;
    company: string;
    received_date: string;
    delivered_date: string | null;
  };
  notificationType: 'received' | 'delivered';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Recibida solicitud de notificación de paquete");
    const { neighbor, package: pkg, notificationType }: PackageNotificationRequest = await req.json();

    if (!neighbor.email) {
      console.error("No se proporcionó un correo electrónico");
      return new Response(
        JSON.stringify({ error: "No se proporcionó un correo electrónico" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Enviando notificación a: ${neighbor.email}, tipo: ${notificationType}`);

    // Format dates for display
    const receivedDate = new Date(pkg.received_date).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let deliveredDate = '';
    if (pkg.delivered_date) {
      deliveredDate = new Date(pkg.delivered_date).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }

    // Different email templates for received and delivered notifications
    let subject, html;

    if (notificationType === 'received') {
      subject = `Paquete de ${pkg.company} registrado para ti`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5; margin-bottom: 24px;">¡Tienes un paquete nuevo!</h1>
          
          <p>Hola ${neighbor.name} ${neighbor.last_name},</p>
          
          <p>Te informamos que se ha registrado un paquete a tu nombre con los siguientes detalles:</p>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p><strong>ID del paquete:</strong> ${pkg.id}</p>
            <p><strong>Compañía:</strong> ${pkg.company}</p>
            <p><strong>Tipo:</strong> ${pkg.type}</p>
            <p><strong>Fecha de recepción:</strong> ${receivedDate}</p>
          </div>
          
          <p>Puedes pasar a recogerlo cuando gustes.</p>
          
          <p style="margin-top: 24px;">Saludos,<br>Administración</p>
        </div>
      `;
    } else {
      subject = `Confirmación de entrega de paquete de ${pkg.company}`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e; margin-bottom: 24px;">¡Has recogido tu paquete!</h1>
          
          <p>Hola ${neighbor.name} ${neighbor.last_name},</p>
          
          <p>Confirmamos que has recogido tu paquete con los siguientes detalles:</p>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p><strong>ID del paquete:</strong> ${pkg.id}</p>
            <p><strong>Compañía:</strong> ${pkg.company}</p>
            <p><strong>Tipo:</strong> ${pkg.type}</p>
            <p><strong>Fecha de recepción:</strong> ${receivedDate}</p>
            <p><strong>Fecha de entrega:</strong> ${deliveredDate}</p>
          </div>
          
          <p>Gracias por recoger tu paquete.</p>
          
          <p style="margin-top: 24px;">Saludos,<br>Administración</p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Notificación de Paquetes <onboarding@resend.dev>",
      to: [neighbor.email],
      subject: subject,
      html: html,
    });

    console.log("Email enviado con éxito:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending package notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
