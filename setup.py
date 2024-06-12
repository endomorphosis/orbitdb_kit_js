from setuptools import setup

setup(
	name='orbitdb_kit',
	version='0.0.3',
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
	],
    package_data={
        'orbitdb_kit': [
            'orbitv3-slave-swarm.js',
        	'package.json',
            'yarn.lock'
        ]
    },
	include_package_data=True,
)