import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtimeData() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection for real-time updates
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Update different data types based on message type
          switch (data.type) {
            case 'contractor_update':
              queryClient.invalidateQueries({ queryKey: ["/api/contractors/active"] });
              break;
            case 'payment_received':
              queryClient.invalidateQueries({ queryKey: ["/api/payments/recent"] });
              queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
              break;
            case 'expense_processed':
              queryClient.invalidateQueries({ queryKey: ["/api/expenses/recent"] });
              break;
            case 'job_update':
              queryClient.invalidateQueries({ queryKey: ["/api/jobs/active"] });
              break;
            case 'vehicle_update':
              queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
              break;
            case 'client_message':
              queryClient.invalidateQueries({ queryKey: ["/api/client-messages"] });
              break;
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  // Function to simulate real-time contractor movement
  useEffect(() => {
    const updateContractorPositions = () => {
      const pins = document.querySelectorAll('.contractor-pin');
      pins.forEach((pin) => {
        const element = pin as HTMLElement;
        const currentTop = parseInt(element.style.top) || Math.random() * 60 + 10;
        const currentLeft = parseInt(element.style.left) || Math.random() * 60 + 10;
        
        // Small random movement
        const newTop = Math.max(5, Math.min(85, currentTop + (Math.random() - 0.5) * 4));
        const newLeft = Math.max(5, Math.min(85, currentLeft + (Math.random() - 0.5) * 4));
        
        element.style.top = newTop + '%';
        element.style.left = newLeft + '%';
      });
    };

    // Update positions every 5 seconds
    const interval = setInterval(updateContractorPositions, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
}
