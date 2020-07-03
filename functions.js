const bjs = require('bitcoinjs-lib');
const bip32 = require('bip32');
const xpub = 'tpubDF8sq8b65bFwnbPsGPRLDxc9s4jJ9U2LmDWdgcJEYhxTJ267MJzKHoQzbSnU5Xp3zTmS34pf6NzBBf4roy5sZRVAk5c1hkmDP45UbM8AQFv';
const network = 'bitcoin.networks.testnet'; //BTC - Bitcoin Testnet
const resource = 'https://api.blockcypher.com/v1/btc/test3';
const token = 'c1c15a770dc04bd3ba8dc3cc0fda1f16'; //my blockcypher token
const path = "m/44'/1'/0'/0";
var chain = 'test3';
var start = 0;
var end = 10;
var name =  'testwallet';
var addresses;
var utxolist;
var receive_wallet;
var change_wallet;

//fetching block of BTC Testnet
//$.get('https://api.blockcypher.com/v1/btc/test3').then(function(d) {console.log(d)});


function address_list (network, xpub, chain, start, end) {	
	//creating a new hd wallet
	var data = {"name": "testwallet", "extended_public_key": xpub };
	$.post('https://api.blockcypher.com/v1/'+network+'/wallets/hd?token='+token, JSON.stringify(data))
  		.then(function(d) {console.log(d)});
	$.post('https://api.blockcypher.com/v1/'+network+'/wallets/hd/testwallet/addresses/derive')
		.then(function(d) {console.log(d)});
}

function add_wallet (network, name, addresses) {
	var data = {"name": name, "extended_public_key": xpub };
  	var data = {"addresses": [addresses]};
	$.post('https://api.blockcypher.com/v1/'+network+'/wallets/hd?token='+token, JSON.stringify(data))
  		.then(function(d) {console.log(d)});
	$.post('https://api.blockcypher.com/v1/'+network+'/wallets/'+name+'/'+addresses+'?token='+token, JSON.stringify(data))
  		.then(function(d) {console.log(d)});
}

function add_addresses (network, name, addresses) {
	var data = {"addresses": [addresses]};
	$.post('https://api.blockcypher.com/v1/'+network+'/wallets/'+name+'/'+addresses+'?token='+token, JSON.stringify(data))
  		.then(function(d) {console.log(d)});
}

function fetch_wallet (network, name) {
	//UTXO fetching
	$.get('https://api.blockcypher.com/v1/'+network'/addrs/'+address+'/unspentOnly=true').then(function(d) {console.log(d)});
}

function utxo_for_coinselect (utxolist) {
	// body...
}

function fetch_utxo (network, receive_wallet, change_wallet) {
	// body...
}