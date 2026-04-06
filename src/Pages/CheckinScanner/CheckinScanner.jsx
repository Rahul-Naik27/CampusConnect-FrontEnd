import React, { useState } from 'react';
import api from '../../api';      // if page is nested two levels deep
// import { getUser } from '../../auth';


const CheckinScanner = () => {
  const [ticketId, setTicketId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setScanning(true);
    setResult(null);

    try {
      const { data } = await api.post('/checkin/scan', { ticketId: ticketId.trim() });
      setResult({ success: true, message: data.message, ticket: data.ticket });
      setTicketId('');
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Scan failed' });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">QR Check-in Scanner</h1>
          <p className="text-gray-600 mb-8">Scan ticket QR codes to check-in attendees</p>

          <form onSubmit={handleScan} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="Enter or scan ticket ID"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-lg"
                autoFocus
              />
              <button
                type="submit"
                disabled={scanning || !ticketId.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {scanning ? 'Scanning...' : 'Scan'}
              </button>
            </div>
          </form>

          {result && (
            <div className={`p-6 rounded-lg ${result.success ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
              <div className={`text-lg font-bold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✓ Success' : '✗ Failed'}
              </div>
              <div className={result.success ? 'text-green-700' : 'text-red-700'}>
                {result.message}
              </div>
              {result.ticket && (
                <div className="mt-4 pt-4 border-t border-green-200 text-sm text-green-800">
                  <div><strong>Ticket ID:</strong> {result.ticket.ticketId}</div>
                  {result.ticket.checkedInAt && (
                    <div><strong>Checked in at:</strong> {new Date(result.ticket.checkedInAt).toLocaleString()}</div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-blue-800 text-sm space-y-2 list-disc list-inside">
              <li>Use a QR code scanner app to scan attendee tickets</li>
              <li>Enter the ticket ID that appears from the QR code</li>
              <li>Click "Scan" to verify and check-in</li>
              <li>Green = successful check-in</li>
              <li>Red = invalid ticket or already checked-in</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckinScanner;
