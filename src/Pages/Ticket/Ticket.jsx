import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import api from '../../api';      // if page is nested two levels deep
// import { getUser } from '../../auth';


const Ticket = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [event, setEvent] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      const { data } = await api.get(`/tickets/${ticketId}`);
      setTicket(data.ticket);
      setEvent(data.event);

      // Generate QR code data URL
      const qr = await QRCode.toDataURL(data.ticket.ticketId, { width: 300 });
      setQrCode(qr);
    } catch (err) {
      console.error('Failed to fetch ticket:', err);
      setTicket(null);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `ticket-${ticketId}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!ticket || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ticket Not Found</h2>
          <button onClick={() => window.history.back()} className="text-purple-600 hover:text-purple-700">← Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">🎫 Your Ticket</h1>
            <p className="opacity-90">Present this QR code at the venue</p>
          </div>

          {/* Ticket Body */}
          <div className="p-8">
            <div className="text-center mb-8">
              {qrCode && (
                <div className="inline-block p-4 bg-white border-4 border-purple-600 rounded-lg">
                  <img src={qrCode} alt="Ticket QR Code" className="w-64 h-64" />
                </div>
              )}
              <div className="mt-4 text-gray-600 font-mono text-sm">{ticket.ticketId}</div>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{event.title}</h2>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 font-semibold">Venue</div>
                  <div className="text-gray-800">{event.venue}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-semibold">Date</div>
                  <div className="text-gray-800">{new Date(event.startAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-semibold">Time</div>
                  <div className="text-gray-800">{new Date(event.startAt).toLocaleTimeString()}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-semibold">Status</div>
                  <div className="text-gray-800">
                    {ticket.checkedInAt ? (
                      <span className="text-green-600 font-semibold">✓ Checked In</span>
                    ) : (
                      <span className="text-blue-600 font-semibold">Valid</span>
                    )}
                  </div>
                </div>
              </div>

              {ticket.checkedInAt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <div className="text-green-800 font-semibold">Checked in at:</div>
                  <div className="text-green-700">{new Date(ticket.checkedInAt).toLocaleString()}</div>
                </div>
              )}
            </div>

            <button
              onClick={downloadQR}
              className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
