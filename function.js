const bitcoin = require('bitcoinjs-lib');  
const coinselect = require('coinselect')
const request = require('request');
const prompt = require('cli-prompt');
const bip32 = require('bip32');
const base58 = require('bs58');
const token = 'ea69b7cda52e4558a6a1233df787f0c9'

//to do: unique identifier for wallet using time, serial number and name at desktop app?
//to do: use API through server
//everything inside "" or '' is string, use  parseInt() to convert to integers or Buffer.from() to convert to byte arrays.
//wait for response wherever required before executing the next code
//check scope variables used

var network = bitcoin.networks.testnet;

var purpose_index = "8000004c";
var coin_index = "00000001";
var account_index = "00000000";
var change_index = "00000001";
var receive_index = "00000000";

var account_xpub_hex = "043587cf03ca70585880000000759f7e7e8eddbeb67805125c0230469cefb0d885c0da8d5310075d6a51fa2426039c35174ae1bcbfb1894566267a882060bb8bfdc3a3f1c6166e490864d48633e195b5c900";//82 bytes
var account_xpub = base58.encode(Buffer.from(account_xpub_hex, 'hex'));

var utxos;
var targets;
var fee_rate = 10;
//let { inputs, outputs, fee } = coinselect(utxos, targets, fee_rate)

function sat_to_btc (value) {
	return value * 0.00000001;
}

function address_list (network, xpub, chain, start, end) {
  let node = bip32.fromBase58(xpub, network)
  let address_list = []
  for (var i = start; i < end; i++) {
    var {address} = bitcoin.payments.p2pkh({pubkey: node.derivePath(`${chain}/${i}`).publicKey, network: network});
    address_list.push(address)
  }
  return address_list
}


function add_wallet (network, name, addresses){

	var data = { name: name, addresses: addresses }

	var options = {
		uri: `https://api.blockcypher.com/v1/btc/test3/wallets?token=${token}`,
		method: 'POST',
		json: data//true,
		//body: JSON.stringify(data)
	};

	request(options, function(err, httpResponse, body) {
		if (err) {
			console.error('Request failed:', err);
		} else {
			console.log('request results:', body);
			
		}
	});
      
}

function add_addresses (network, name, addresses){

	var data = { addresses: addresses }

	var options = {
		uri: `https://api.blockcypher.com/v1/btc/test3/wallets/${name}/addresses?token=${token}`,
		method: 'POST',
		json: data//true,
		//body: JSON.stringify(data)
	};

	request(options, function(err, httpResponse, body) {
		if (err) {
			console.error('Request failed:', err);
		} else {
			console.log('request results:', body);
			
		}
	});
      
}

function fetch_wallet (network, name){

	var url = `https://api.blockcypher.com/v1/btc/test3/wallets/${name}?token=${token}`
	request(url, function(err, httpResponse, body) {
		if (err) {
			console.error('Request failed:', err);
		} else {
			console.log('request results:', body);
		}
	});
}

function utxo_for_coinselect( utxolist){
  const resultSet = new Set();
  utxolist.forEach(utxo => {
    const obj = {
      txId: utxo.tx_hash,
      vout: utxo.tx_output_n,
      value: utxo.value,
      address: utxo.address
    };
    resultSet.add(JSON.stringify(obj));
  });
  const resultList = [];
  resultSet.forEach(tx => {
    resultList.push(JSON.parse(tx));
  });
  return resultList;
};


function fetch_utxo (network, receive_wallet, change_wallet ){

	var url_receive = `https://api.blockcypher.com/v1/btc/test3/addrs/${receive_wallet}?token=${token}&unspentOnly=true`;
	var url_change = `https://api.blockcypher.com/v1/btc/test3/addrs/${change_wallet}?token=${token}&unspentOnly=true`;
	var json_receive;
	var json_change;
	request(url_receive, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			json_receive = JSON.parse(body);
		}
		else {
			console.log("Unable to find any receive wallet unspent transaction outputs.");
			if (error) console.log("ERROR:", error);
		}
		utxos = utxo_for_coinselect(json_receive["txrefs"]);
		targets = [
		{
			address: 'mgh7YLxsBdx62LZFNJtLyusBu5BFUJ13xf',
    		value: 1800000
		},
		{
			address: 'mztA9mzFRJFdA6eQDBEh9Myh1uj2pdoUG5',
    		value: 5000
		}
		]
		let { inputs, outputs, fee } = coinselect(utxos, targets, fee_rate);
		console.log(inputs);
		console.log(outputs);
		//var script_public_key = bitcoin.address.toOutputScript(address, network);
		//var txb = new bitcoin.TransactionBuilder(network);
		//txb.addInput();
		//txb.addOutput();
		//var unsigned_tx = txb.buildIncomplete();
		//unsigned_tx.ins[0].script = Buffer.from(script_public_key, 'hex');
		//console.log(unsigned_tx.toHex());
		// console.log(json_receive.txrefs.length);
		// for (var i = 0; i < json_receive.txrefs.length; i++ ){
		// 	console.log(json_receive["txrefs"][i]["address"]);
		// }
	});
	request(url_change, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			json_change = JSON.parse(body);
		}
		else {
			console.log("Unable to find any change wallet unspent transaction outputs.");
			if (error) console.log("ERROR:", error);
		}
		//console.log(json_change.txrefs.length);
		// if(!(json_change["txrefs"] == undefined)){
		// 	console.log("txrefs not found in change wallet");
		// }
		// else{
		// 	console.log(json_change["txrefs"]);
		// }
	});
}


function broadcast_tx (tx) {

	console.log("tx in hex = ", tx.toHex());

	var options = {
		uri: 'https://api.blockcypher.com/v1/btc/test3/txs/push',
		method: 'POST',
		json: {
			"tx": tx.toHex()
		}
	};

	request(options, function(err, httpResponse, body) {
		if (err) {
			console.error('Request failed:', err);
		} else {
			console.log('Broadcast results:', body);
			console.log("Transaction sent with hash:", tx.getId());
		}
	});
}

let receive_list = address_list(network, account_xpub, parseInt(receive_index, 16), 0, 20);
let change_list = address_list(network, account_xpub, parseInt(change_index, 16), 0, 20);


function buildTransaction(inputs, outputs) {

	if (!inputs || !outputs) return
    var txBuilder = new bitcoin.TransactionBuilder(network)
    for(var i = 0; i < inputs.length; i++){
        var input = inputs[i]
        txBuilder.addInput(input.txid, input.vout, 0xffffffff, Buffer.from(input.scriptPubKey, 'hex'))
    }

    for(var i = 0; i < outputs.length; i++){
        var output = outputs[i]
        txBuilder.addOutput(output.address, output.amount)
    }
    var tx = txBuilder.buildIncomplete()
    for(var i = 0; i < inputs.length; i++){
        var input = inputs[i]
        tx.ins[i].script = Buffer.from(input.scriptPubKey, 'hex')
    }
    return tx.toHex()
}

//fetch_utxo(network, "vipulReceive", "vipulChange");

//add_addresses (network, "vipulReceive", receive_list);

//add_wallet (network, "vipulReceive", receive_list);
//add_wallet (network, "vipulChange", change_list);

//fetch_wallet (network, "vipulReceive");
// Function used to build a new unsigned transaction