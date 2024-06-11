 
import os
import sys
import subprocess as process 
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import os
import sys
import json
import time
import logging
import asyncio
import io
import tempfile
import subprocess
import datetime
import requests
import urllib.request
import urllib.parse
import urllib.error
import urllib3
import shutil
import subprocess
parent_dir = os.path.dirname(os.path.dirname(__file__))
sys.path.append(parent_dir)
orbitdb_kit_dir = os.path.join(os.path.dirname(__file__), 'orbitdb_kit')
sys.path.append(orbitdb_kit_dir)
from orbitdb_kit import orbitdb_kit_lib

class orbitdb_kit:
    def __init__(self, resources, meta=None):
        self.resources = resources
        self.meta = meta

    def start_orbitdb(self):
        start_orbitdb = process.Popen(['orbitdb', 'start'], stdout=process.PIPE, stderr=process.PIPE)
        pass

    def stop_orbitdb(self):
        stop_orbitdb = process.Popen(['orbitdb', 'stop'], stdout=process.PIPE, stderr=process.PIPE)
        pass
    
    def get_resources(self):
        return self.resources
    
if __name__ == '__main__':
    resources = {}
    meta = {}
    orbit_kit = orbitdb_kit(resources, meta)
    print(orbit_kit.get_resources())

