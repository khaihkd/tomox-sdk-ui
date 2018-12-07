//@flow
import { utils } from 'ethers';

// we process token, deposit in socket way
import * as appActionCreators from '../actions/app';
import * as actionCreators from '../actions/socketController';
import * as tokenActionCreators from '../actions/tokens';
import * as depositActionCreators from '../actions/deposit';
import {
  getAccountDomain,
  getTokenPairsDomain,
  getWebsocketDomain
} from '../domains';

import { queryBalances } from './depositForm';
import { getSigner } from '../services/signer';
import {
  parseOrder,
  parseTrade,
  parseTrades,
  parseTokens,
  parseAddressAssociation,
  parseOrderBookData,
  parseOHLCV
} from '../../utils/parsers';

import type { State, Dispatch, GetState, ThunkAction } from '../../types/';
import type { WebsocketEvent, WebsocketMessage } from '../../types/websocket';

export default function socketControllerSelector(state: State) {
  return {
    authenticated: getAccountDomain(state).authenticated(),
    pairs: getTokenPairsDomain(state).getPairsByCode(),
    isOpened: getWebsocketDomain(state).isOpened()
  };
}

// eslint-disable-next-line
export function openConnection(): ThunkAction {
  return (dispatch, getState, { socket }) => {
    socket.createConnection();
    dispatch(actionCreators.createConnection());

    const closeConnection = socket.openConnection(event => {
      switch (event.type) {
        case 'close':
          return handleWebsocketCloseMessage(dispatch, event, closeConnection);
        case 'error':
          return handleWebsocketErrorMessage(dispatch, event, closeConnection);
        case 'open':
          return handleWebsocketOpenMessage(dispatch, event);
        default:
          break;
      }
    });

    socket.onMessage((message: WebsocketMessage) => {
      let { channel, event } = message;
      // we can pass dispatch, or call dispatch to update redux
      switch (channel) {
        case 'orders':
          return handleOrderMessage(dispatch, event, getState);
        case 'orderbook':
          return handleOrderBookMessage(dispatch, event, getState);
        case 'trades':
          return handleTradesMessage(dispatch, event, getState);
        case 'ohlcv':
          return handleOHLCVMessage(dispatch, event, getState);
        case 'tokens':
          return handleTokenMessage(dispatch, event, getState);
        case 'deposit':
          // update tokens balances, tokens changes
          return handleDepositMessage(dispatch, event, getState);
        default:
          console.log(channel, event);
          break;
      }
    });

    return () => {
      //TODO currently, i believe the unsubscription is only used by SocketController/componentDidMount function
      //TODO This causes a notification to appear while we do not want to display a 'Connection lost' notification when logging out.
      //TODO Therefore i currently do not close the connection gracefully to avoid this problem. Looking for a workaround
      // closeConnection()
      dispatch(actionCreators.closeConnection());
    };
  };
}

const handleWebsocketOpenMessage = (dispatch, event) => {
  // tell socket is open
  dispatch(actionCreators.openConnection());
  dispatch(
    appActionCreators.addSuccessNotification({
      message: 'Connection successful'
    })
  );
};

const handleWebsocketCloseMessage = (
  dispatch: Dispatch,
  event,
  closeConnection
) => {
  dispatch(
    appActionCreators.addErrorNotification({
      message: 'Connection lost'
    })
  );
  setTimeout(() => dispatch(openConnection()), 5000);
};

const handleWebsocketErrorMessage = (
  dispatch: Dispatch,
  event: WebsocketEvent,
  closeConnection
) => {
  console.log(event);
};

const handleDepositMessage = (
  dispatch: Dispatch,
  event: WebsocketEvent,
  getState: GetState
) => {
  const { type } = event;
  switch (type) {
    case 'UPDATE':
      return handleDepositUpdated(dispatch, event, getState);
    // trigger updating all tokens balances
    case 'SUCCESS':
      return handleDepositSucceeded(dispatch, event, getState);
    default:
      console.log('Unknown', event);
      return;
  }
};

function handleDepositUpdated(
  dispatch: Dispatch,
  event: WebsocketEvent,
  getState
) {
  try {
    // let state = getState();
    const parsed = parseAddressAssociation(event.payload);
    if (parsed) {
      const { chain, addressAssociation } = parsed;
      // console.log(chain, addressAssociation, event.payload);
      dispatch(
        appActionCreators.addSuccessNotification({ message: 'Deposit updated' })
      );
      dispatch(
        depositActionCreators.updateAddressAssociation(
          chain,
          addressAssociation
        )
      );
    }
  } catch (e) {
    console.log(e);
    dispatch(
      appActionCreators.addErrorNotification({
        message: e.message
      })
    );
  }
}

function handleDepositSucceeded(
  dispatch: Dispatch,
  event: WebsocketEvent,
  getState
) {
  try {
    // let state = getState();
    if (event.payload) {
      const { chain, txEnvelopes } = event.payload;
      // console.log(chain, addressAssociation, event.payload);
      dispatch(
        appActionCreators.addSuccessNotification({
          message: 'Balances updated'
        })
      );
      dispatch(
        depositActionCreators.updateAssociationTransactions(chain, txEnvelopes)
      );
      dispatch(queryBalances());
    }
  } catch (e) {
    console.log(e);
    dispatch(
      appActionCreators.addErrorNotification({
        message: e.message
      })
    );
  }
}

const handleTokenMessage = (
  dispatch: Dispatch,
  event: WebsocketEvent,
  getState: GetState
) => {
  const { type } = event;
  switch (type) {
    case 'UPDATE':
      return handleTokenListUpdated(dispatch, event, getState);
    default:
      console.log('Unknown', event);
      return;
  }
};

function handleTokenListUpdated(
  dispatch: Dispatch,
  event: WebsocketEvent,
  getState
) {
  try {
    let state = getState();
    if (event.payload) {
      let tokens = parseTokens(event.payload);

      dispatch(
        appActionCreators.addSuccessNotification({ message: 'Tokens updated' })
      );
      dispatch(tokenActionCreators.updateTokensList(tokens));
    }
  } catch (e) {
    console.log(e);
    dispatch(
      appActionCreators.addErrorNotification({
        message: e.message
      })
    );
  }
}

const handleOrderMessage = (
  dispatch: Dispatch,
  event: WebsocketEvent,
  getState: GetState
) => {
  const { type } = event;

  switch (type) {
    case 'ORDER_ADDED':
      return handleOrderAdded(dispatch, event, getState);
    case 'ORDER_CANCELLED':
      return handleOrderCancelled(dispatch, event, getState);
    case 'ORDER_MATCHED':
      return handleOrderMatched(dispatch, event, getState);
    case 'ERROR':
      return handleOrderError(dispatch, event, getState);
    // methods that need async
    case 'ORDER_SUCCESS':
      return dispatch(handleOrderSuccess(event));
    case 'ORDER_PENDING':
      return dispatch(handleOrderPending(event));
    default:
      console.log('Unknown', event);
      return;
  }
};

function handleOrderAdded(dispatch: Dispatch, event: WebsocketEvent, getState) {
  try {
    let state = getState();
    let { pairs } = socketControllerSelector(state);
    let order = event.payload;
    if (order) {
      let { baseTokenDecimals } = pairs[order.pairName];

      order = parseOrder(order, baseTokenDecimals);

      dispatch(appActionCreators.addOrderAddedNotification());
      dispatch(actionCreators.updateOrdersTable([order]));
    }
  } catch (e) {
    console.log(e);
    dispatch(
      appActionCreators.addErrorNotification({
        message: e.message
      })
    );
  }
}

function handleOrderCancelled(
  dispatch: Dispatch,
  event: WebsocketEvent,
  getState: GetState
) {
  try {
    let state = getState();
    let { pairs } = socketControllerSelector(state);
    let order = event.payload;
    if (order) {
      let { baseTokenDecimals } = pairs[order.pairName];

      order = parseOrder(order, baseTokenDecimals);

      dispatch(appActionCreators.addOrderCancelledNotification());
      dispatch(actionCreators.updateOrdersTable([order]));
    }
  } catch (e) {
    console.log(e);
    dispatch(
      appActionCreators.addErrorNotification({
        message: e.message
      })
    );
  }
}

function handleOrderMatched(
  dispatch: Dispatch,
  event: WebsocketEvent,
  getState: GetState
) {
  try {
    let state = getState();
    let { pairs } = socketControllerSelector(state);
    let order = event.payload;
    if (order) {
      let { baseTokenDecimals } = pairs[order.pairName];

      order = parseOrder(order, baseTokenDecimals);

      dispatch(appActionCreators.addOrderMatchedNotification());
      dispatch(actionCreators.updateOrdersTable([order]));
    }
  } catch (e) {
    console.log(e);
    dispatch(
      appActionCreators.addErrorNotification({
        message: e.message
      })
    );
  }
}

function handleOrderSuccess(event: WebsocketEvent): ThunkAction {
  return async (dispatch, getState) => {
    try {
      let state = getState();
      let { pairs } = socketControllerSelector(state);
      let signer = getSigner();
      let signerAddress = await signer.getAddress();
      // if (!event.payload) {
      //   throw new Error('No matches found');
      // }
      let { matches } = event.payload || {};
      let trades = matches.trades;
      let txHash = trades[0].txHash;
      let pairName = trades[0].pairName;
      let userOrders = [];
      let userTrades = [];
      let userIsTaker =
        utils.getAddress(matches.takerOrder.userAddress) === signerAddress;
      let {
        baseTokenDecimals
        // quoteTokenDecimals
      } = pairs[pairName];
      if (userIsTaker) {
        let parsedOrder = parseOrder(matches.takerOrder, baseTokenDecimals);
        userOrders = [parsedOrder];
        userTrades = matches.trades.map(trade =>
          parseTrade(trade, baseTokenDecimals)
        );
        let { price, amount, side, filled, pair } = parsedOrder;
        dispatch(
          appActionCreators.addOrderSuccessNotification({
            txHash,
            pair,
            price,
            amount,
            filled,
            side
          })
        );
      } else {
        matches.makerOrders.forEach(order => {
          if (utils.getAddress(order.userAddress) === signerAddress) {
            let parsedOrder = parseOrder(order, baseTokenDecimals);
            userOrders.push(parsedOrder);
            let { price, amount, filled, side, pair } = parsedOrder;
            dispatch(
              appActionCreators.addOrderSuccessNotification({
                txHash,
                pair,
                price,
                amount,
                filled,
                side
              })
            );
          }
        });

        matches.trades.forEach(trade => {
          if (
            utils.getAddress(trade.maker) === signerAddress ||
            utils.getAddress(trade.taker) === signerAddress
          ) {
            userTrades.push(parseTrade(trade, baseTokenDecimals));
          }
        });
      }

      if (userOrders.length > 0)
        dispatch(actionCreators.updateOrdersTable(userOrders));
      if (userTrades.length > 0)
        dispatch(actionCreators.updateTradesTable(userTrades));
    } catch (e) {
      console.log(e);
      dispatch(
        appActionCreators.addErrorNotification({
          message: e.message
        })
      );
    }
  };
}

function handleOrderPending(event: WebsocketEvent): ThunkAction {
  return async (dispatch, getState, { socket }) => {
    try {
      let signer = getSigner();
      let state = getState();
      let { pairs } = socketControllerSelector(state);
      let signerAddress = await signer.getAddress();
      let { matches } = event.payload || {};
      let trades = matches.trades;
      let txHash = trades[0].txHash;
      let pairName = trades[0].pairName;
      let userOrders = [];
      let userTrades = [];
      let userIsTaker =
        utils.getAddress(matches.takerOrder.userAddress) === signerAddress;
      let { baseTokenDecimals } = pairs[pairName];

      if (userIsTaker) {
        let parsedOrder = parseOrder(matches.takerOrder);
        userOrders = [parsedOrder];
        userTrades = matches.trades.map(trade =>
          parseTrade(trade, baseTokenDecimals)
        );
        let { price, amount, side, filled, pair } = parsedOrder;
        dispatch(
          appActionCreators.addOrderPendingNotification({
            txHash,
            pair,
            price,
            amount,
            filled,
            side
          })
        );
      } else {
        matches.makerOrders.forEach(order => {
          if (utils.getAddress(order.userAddress) === signerAddress) {
            let parsedOrder = parseOrder(order, baseTokenDecimals);
            userOrders.push(parsedOrder);
            let { price, amount, filled, side, pair } = parsedOrder;
            dispatch(
              appActionCreators.addOrderPendingNotification({
                txHash,
                pair,
                price,
                amount,
                filled,
                side
              })
            );
          }
        });

        matches.trades.forEach(trade => {
          if (
            utils.getAddress(trade.maker) === signerAddress ||
            utils.getAddress(trade.taker) === signerAddress
          ) {
            userTrades.push(parseTrade(trade, baseTokenDecimals));
          }
        });
      }

      if (userOrders.length > 0)
        dispatch(actionCreators.updateOrdersTable(userOrders));
      if (userTrades.length > 0)
        dispatch(actionCreators.updateTradesTable(userTrades));
    } catch (e) {
      console.log(e);
      dispatch(
        appActionCreators.addErrorNotification({
          message: e.message
        })
      );
    }
  };
}

function handleOrderError(
  dispatch: Dispatch,
  event: WebsocketEvent,
  getState: GetState
) {
  if (event.payload) {
    let { message } = event.payload;
    dispatch(
      appActionCreators.addErrorNotification({
        message: `Error: ${message}`
      })
    );
  }
}

const handleOrderBookMessage = (
  dispatch: Dispatch,
  event: WebsocketEvent,
  getState: GetState
) => {
  let state = getState();
  let { pairs } = socketControllerSelector(state);

  if (!event.payload) return;
  if (event.payload.length === 0) return;

  // console.log(event, pairs);

  let { pairName } = event.payload;
  let {
    baseTokenDecimals
    // quoteTokenDecimals
  } = pairs[pairName];

  try {
    let { bids, asks } = parseOrderBookData(event.payload, baseTokenDecimals);
    switch (event.type) {
      case 'INIT':
        dispatch(actionCreators.initOrderBook(bids, asks));
        break;

      case 'UPDATE':
        dispatch(actionCreators.updateOrderBook(bids, asks));
        break;

      default:
        return;
    }
  } catch (e) {
    dispatch(
      appActionCreators.addErrorNotification({
        message: e.message
      })
    );
    console.log(e);
  }
};

const handleTradesMessage = (
  dispatch: Dispatch,
  event: WebsocketEvent,
  getState: GetState
) => {
  // console.log(event)
  let state = getState();
  let { pairs } = socketControllerSelector(state);

  if (!event.payload) return;
  if (event.payload.length === 0) return;

  let trades = event.payload;
  let { pairName } = trades[0];
  let { baseTokenDecimals } = pairs[pairName];

  try {
    switch (event.type) {
      case 'INIT':
        trades = parseTrades(trades, baseTokenDecimals);
        dispatch(actionCreators.initTradesTable(trades));
        break;
      case 'UPDATE':
        trades = parseTrades(trades, baseTokenDecimals);
        dispatch(actionCreators.updateTradesTable(trades));
        break;
      default:
        return;
    }
  } catch (e) {
    dispatch(
      appActionCreators.addErrorNotification({
        message: e.message
      })
    );
    console.log(e);
  }
};

const handleOHLCVMessage = (
  dispatch: Dispatch,
  event: WebsocketEvent,
  getState: GetState
) => {
  let state = getState();
  let { pairs } = socketControllerSelector(state);

  if (!event.payload) return;
  if (event.payload.length === 0) return;

  let ohlcv = event.payload;
  let { pairName } = ohlcv[0].pair;
  let { baseTokenDecimals } = pairs[pairName];

  try {
    switch (event.type) {
      case 'INIT':
        ohlcv = parseOHLCV(ohlcv, baseTokenDecimals);
        dispatch(actionCreators.initOHLCV(ohlcv));
        break;
      case 'UPDATE':
        ohlcv = parseOHLCV(ohlcv, baseTokenDecimals);
        dispatch(actionCreators.updateOHLCV(ohlcv));
        break;
      default:
        return;
    }
  } catch (e) {
    console.log(e);
    dispatch(
      appActionCreators.addErrorNotification({
        message: e.message
      })
    );
  }
};