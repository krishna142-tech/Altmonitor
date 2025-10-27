from setuptools import setup, find_packages

setup(
    name="altmonitor",
    version="0.1",
    packages=find_packages(),
    install_requires=open('backend/requirements.txt').readlines(),
)
