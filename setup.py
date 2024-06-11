from setuptools import setup

setup(
	name='orbitdb_kit',
	version='0.0.1',
	packages=[
		'orbitdb_kit',
	],
	install_requires=[
		'datasets',
		'urllib3',
		'requests',
		'boto3',
        'toml',
	]
)