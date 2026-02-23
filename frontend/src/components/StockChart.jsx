import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import axios from 'axios';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';

const StockChart = ({ ticker = 'TCS' }) => {
    const { user } = useAuth();
    const chartContainerRef = useRef();
    const [chart, setChart] = useState(null);
    const [candlestickSeries, setCandlestickSeries] = useState(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chartInstance = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#111827' }, // Gray-900 matches theme
                textColor: '#9CA3AF',
            },
            grid: {
                vertLines: { color: '#374151' },
                horzLines: { color: '#374151' },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const series = chartInstance.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        setChart(chartInstance);
        setCandlestickSeries(series);

        const handleResize = () => {
            chartInstance.applyOptions({
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartInstance.remove();
        };
    }, []);

    // Fetch Initial Data
    useEffect(() => {
        if (!candlestickSeries) return;

        const fetchData = async () => {
            if (!user?.token) return;
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/market/candles/${ticker}/1m`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const data = res.data.map(item => ({
                    time: item.time / 1000, // lightweight-charts uses seconds
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                }));
                // Sort by time just in case
                data.sort((a, b) => a.time - b.time);
                candlestickSeries.setData(data);
            } catch (error) {
                console.error("Failed to load chart data", error);
            }
        };

        fetchData();
    }, [ticker, candlestickSeries]);

    // WebSocket Updates
    useEffect(() => {
        if (!candlestickSeries) return;

        const handleCandleUpdate = (data) => {
            if (data.ticker === ticker && data.interval === '1m') {
                candlestickSeries.update({
                    time: data.candle.time / 1000,
                    open: data.candle.open,
                    high: data.candle.high,
                    low: data.candle.low,
                    close: data.candle.close,
                });
            }
        };

        socket.on('candleUpdate', handleCandleUpdate);

        return () => {
            socket.off('candleUpdate', handleCandleUpdate);
        };
    }, [ticker, candlestickSeries]);

    return (
        <div className="w-full h-full relative group">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-white tracking-tight">{ticker}</h3>
                    <span className="text-sm font-medium text-gray-500">1m</span>
                </div>
            </div>
            <div ref={chartContainerRef} className="w-full h-full" />
        </div>
    );
};

export default StockChart;
