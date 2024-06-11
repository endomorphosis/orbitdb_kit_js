import websocket
import json
from urllib.parse import urlencode
import _thread
import time
import rel

class WebSocketClient:
	def __init__(self, master_url, meta):

		if master_url is None:
			raise ValueError('master_url is required')
		else:
			self.master_url = master_url
		self.state = {'status': 'disconnected'}
		if meta is None:
			meta = {}
			self.on_open = self.on_open
			self.on_message = self.on_message
			self.on_error = self.on_error
			self.on_close = self.on_close
		else:
			if 'on_open' not in meta:
				self.on_open = self.on_open
			else:
				self.on_open = meta['on_open']
			if 'on_message' not in meta:
				self.on_message = self.on_message
			else:
				self.on_message = meta['on_message']
			if 'on_error' not in meta:
				self.on_error = self.on_error
			else:
				self.on_error = meta['on_error']
			if 'on_close' not in meta:
				self.on_close = self.on_close
			else:
				self.on_close = meta['on_close']

	def run_once(self):
		while True:
			try:
				self.ws = websocket.create_connection(self.master_url)
			except Exception as e:
				print(e)	
		return True

	def run_forever(self):
		print('connecting to master')
		self.state = {
			'status': 'disconnected'
		}

		self.ws.run_forever(dispatcher=rel, reconnect=5)  # Set dispatcher to automatic reconnection, 5 second reconnect delay if connection closed unexpectedly
		rel.signal(2, rel.abort)  # Keyboard Interrupt
		rel.dispatch()
		self.ws.run_forever(
			ping_interval=5,
			ping_timeout=2
		)
		
		return True
	
	def close(self):
		self.ws.close()
		return True

	def run_forever(self, master_url, interval=15, timeout=2):
		this_master_url = None
		if master_url is None and self.master_url is None:
			raise ValueError('master_url is required')
		else:
			if master_url is not None:
				this_master_url = master_url
			elif self.master_url is not None:
				this_master_url = self.master_url
			else:
				raise ValueError('master_url is required')
			
		self.ws = websocket.WebSocketApp(
			this_master_url,
			on_open=self.on_open,
			on_message=self.on_message,
			on_error=self.on_error,
			on_close=self.on_close,
		)
		self.ws.run_forever(
			ping_interval=interval,
			ping_timeout=timeout
		)

	def set_handlers(self, **handlers):
		self.handlers = handlers
		
	def send(self, message):
		self.ws.send(json.dumps(message))

	def recv(self):
		results = self.ws.recv()
		print(results)
		return results
		
	def on_open(self, ws):
		print('connection accepted')
		self.send({'peers': 'ls'})

	def on_close(self, ws, code, message):
		print('lost connection to master')
		self.state['status'] = 'disconnected'
		
	def on_error(self, ws, error):
		if isinstance(error, KeyboardInterrupt):
			print('socket closed and exiting gracefully')
			exit(0)

	def on_message(self, ws, message):
		try:
			payload = json.loads(message)
			command = payload['command']
			del payload['command']
			self.handlers[command](**payload)

		except Exception as e:
			print('error while handling message from master:')
			print(e)
			pass

	def create_connection(self):
		self.ws = websocket.create_connection("ws://echo.websocket.events/")
		return True

	def test_run_forever(self):
		results = self.run_forever(self.master_url)
		print(results)
		return True

	def test_run_once(self):
		self.run_once()
		self.send(json.load({'peers': 'ls'}))
		self.recv()
		return True
 
	def log_message(self, message):
		# NOTE this is a placeholder for a logging function, to try to traceback errors
		print(message)
		return True

if __name__ == '__main__':
	client = WebSocketClient('ws://127.0.0.1:50001', {})
	# test = client.test_run_once()
	test = client.test_run_forever()
	# subscribe = client.subscribe()
