//@flow
import {
  isFloat,
  isInteger,
  round
} from './helpers';

import {
  utils
} from 'ethers';

import type {
  TokenPairData
} from '../types/tokens'

import type {
  Order,
  Orders
} from '../types/orders';
import type {
  Trade,
  Trades
} from '../types/trades';

export const parseJSONData = (obj: Object): Object => {
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      parseJSONData(obj[key]);
    } else if (typeof obj[key] === typeof []) {
      obj[key].forEach(elem => parseJSONData(elem));
    } else {
      if (typeof obj[key] === 'string') {
        if (isFloat(obj[key])) {
          obj[key] = parseFloat(obj[key]);
        } else if (isInteger(obj[key])) {
          obj[key] = parseInt(obj[key], 10);
        }
      }
    }
  }

  return obj;
};

export const parseJSONToFixed = (obj: Object, decimals: number = 2): Object => {
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      parseJSONToFixed(obj[key], decimals);
    } else if (typeof obj[key] === typeof []) {
      obj[key].forEach(elem => parseJSONToFixed(elem, decimals));
    } else if (typeof obj[key] === 'string') {
      if (isFloat(obj[key])) {
        obj[key] = round(obj[key], decimals);
      } else if (isInteger(obj[key])) {
        obj[key] = round(obj[key], decimals);
      }
    } else if (typeof obj[key] === 'number') {
      obj[key] = round(obj[key], decimals);
    }
  }

  return obj;
};

export const parseTokenAmount = (
  amount: number,
  tokenDecimals: number = 18,
  precision: number = 2
): number => {
  let precisionMultiplier = utils.bigNumberify((10 ** precision).toString());
  let decimalsMultiplier = utils.bigNumberify((10 ** tokenDecimals).toString());
  let bigAmount = utils
    .bigNumberify(amount)
    .mul(precisionMultiplier)
    .div(decimalsMultiplier);

  return Number(bigAmount) / Number(precisionMultiplier);
};

export const parsePricepoint = (
  pricepoint: number,
  pricePointMultiplier: number = 1e9,
  precision: number = 6
): number => {
  return (
    Math.round((pricepoint / pricePointMultiplier) * Math.pow(10, precision)) /
    Math.pow(10, precision)
  );
};

export const parseOrder = (
  order: Object,
  tokenDecimals: number = 18,
  precision: number = 2
): Order => ({
  time: order.createdAt,
  amount: parseTokenAmount(order.amount, tokenDecimals, precision),
  filled: parseTokenAmount(order.filledAmount, tokenDecimals, precision),
  price: parsePricepoint(order.pricepoint),
  hash: order.hash,
  side: order.side,
  pair: order.pairName,
  type: 'LIMIT',
  status: order.status,
  cancellable: order.cancellable
});

export const parseOrders = (
  orders: Array < Object > ,
  tokenDecimals: number = 18,
  precision: number = 2
): Orders => {
  let parsed = orders.map(order => ({
    time: order.createdAt,
    amount: parseTokenAmount(order.amount, tokenDecimals, precision),
    filled: parseTokenAmount(order.filledAmount, tokenDecimals, precision),
    price: parsePricepoint(order.pricepoint),
    hash: order.hash,
    side: order.side,
    pair: order.pairName,
    type: 'LIMIT',
    status: order.status,
    cancellable: order.cancellable
  }));

  return parsed;
};

export const parseTrade = (
  trade: Object,
  tokenDecimals: number = 18,
  precision: number = 2
): Trade => ({
  time: trade.createdAt,
  price: parsePricepoint(trade.pricepoint),
  amount: parseTokenAmount(trade.amount, tokenDecimals, precision),
  hash: trade.hash,
  orderHash: trade.orderHash,
  type: trade.type || 'LIMIT',
  side: trade.side,
  pair: trade.pairName,
  status: trade.status === 'SUCCESS' ? 'EXECUTED' : trade.status,
  maker: utils.getAddress(trade.maker),
  taker: utils.getAddress(trade.taker),
  signature: trade.signature,
  tradeNonce: trade.tradeNonce
});

export const parseTrades = (
  trades: Array < Object > ,
  tokenDecimals: number = 18,
  precision: number = 2
): Trades => {
  let parsed = trades.map(trade => parseTrade(trade, tokenDecimals, precision));

  return parsed;
};

export const parseOrderBookData = (
  data: Object,
  tokenDecimals: number = 18,
  precision: number = 2
): Object => {
  let {
    bids,
    asks
  } = data;

  asks = asks.map(ask => ({
    price: parsePricepoint(ask.pricepoint),
    amount: parseTokenAmount(ask.amount, tokenDecimals, precision)
  }));

  bids = bids.map(bid => ({
    price: parsePricepoint(bid.pricepoint),
    amount: parseTokenAmount(bid.amount, tokenDecimals, precision)
  }));

  return {
    asks,
    bids
  };
};

export const parseTokenPairData = (
  data: Array < Object > ,
  tokenDecimals: number = 18
): Array < TokenPairData > => {
  let parsed = data.map(datum => ({
    base: null,
    quote: null,
    favorited: null,
    pair: datum.pair.pairName,
    lastPrice: datum.close ? parsePricepoint(datum.close) : null,
    change: datum.open ?
      round((datum.close - datum.open) / datum.open, 1) : null,
    high: datum.high ? parsePricepoint(datum.high) : null,
    low: datum.low ? parsePricepoint(datum.low) : null,
    volume: datum.volume ?
      parseTokenAmount(datum.volume, tokenDecimals, 0) : null
  }));

  return parsed;
};

export const parseOHLCV = (
  data: Array < Object > ,
  baseTokenDecimals: number = 18
): Array < Object > => {
  let parsed = data.map(datum => {
    return {
      date: new Date(datum.timestamp),
      open: parsePricepoint(datum.open),
      high: parsePricepoint(datum.high),
      low: parsePricepoint(datum.low),
      close: parsePricepoint(datum.close),
      volume: parseTokenAmount(datum.volume, baseTokenDecimals, 2)
    };
  });

  return parsed;
};