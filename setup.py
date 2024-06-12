from setuptools import setup

setup(
	name='orbitdb_kit',
	version='0.0.2',
	packages=[
		'orbitdb_kit',
        'orbitdb_kit.websocket_kit',
        'orbitdb_kit.config',
	],
	install_requires=[
		'datasets',
		'urllib3',
		'requests',
		'boto3',
        'toml',
	]
)