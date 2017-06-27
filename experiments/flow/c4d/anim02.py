import c4d
import helpers
import random
from OSC import OSCServer
import sys
from time import sleep
import threading


server = 0;
st = 0;
spheres = []
objNull = 0
numParticles = 400


def initOSCServer(ip='localhost', port=8928) :
    print "---server"
    print server;
    global server, st
    server = OSCServer( (ip ,port) ) # basic
    server.addDefaultHandlers()
    print server
    
        
def startOSCServer() :
    print "Registered Callback-functions are :"
    for addr in server.getOSCAddressSpace():
        print addr
    st = threading.Thread( target = server.serve_forever )
    st.start()
    
def printing_handler(addr, tags, data, source):
    print "---"
    print "with addr : %s" % addr
    print "typetags :%s" % tags
    print "the actual data is : %s" % data
    print "---"
    
def setOSCHandler(address="/print", hd=printing_handler) :
    server.addMsgHandler(address, hd) # adding our function
    
def updateSphere(addr, tags, data, source) :
    center = doc.SearchObject('Center')
    cx = data[0]
    cy = data[1]
    cz = data[2]
    vv = c4d.Vector(-cx, cy, cz)
    center.SetRelPos(vv)
    helpers.addKey(center, c4d.ID_BASEOBJECT_REL_POSITION)
    
    print "Sphere:", sphere, v
   
    
def updateParticlePosition(addr, tags, data, source) :
    
    print "Update position : "
    s = data[0]
    
    positions = [float(x) for x in s.split()]
    ss = 0
    
    for i in range(0, numParticles) :
        x = positions[i*3 + 0]
        y = positions[i*3 + 1]
        z = positions[i*3 + 2]
        
        ss = spheres[i]
        v = c4d.Vector(-x, y, z)
        ss.SetRelPos(v)
        helpers.addKey(ss, c4d.ID_BASEOBJECT_REL_POSITION)
    
    c4d.EventAdd()
    
    
def setFrame(addr, tags, data, source) :
    fps = doc.GetFps()
    frame = int(data[0])
    print "Go to frame:", frame
    time = c4d.BaseTime(frame, fps)
    doc.SetTime(time)


def onUpdate(addr, tags, data, source):
    c4d.EventAdd()
    

def main():
    global objNull
    needToAdd = objNull == 0
    objNull = c4d.BaseObject(c4d.Onull);
    
    vScale = c4d.Vector(.1, .1, .1)
    for i in range(0, numParticles):
        sphere = c4d.BaseObject(c4d.Osphere)
        sphere.InsertUnder(objNull)
        sphere.SetRelScale(vScale)
        spheres.append(sphere)
    
    if needToAdd :
        doc.InsertObject(objNull)
        initOSCServer()
        setOSCHandler('/positions', updateParticlePosition)
        setOSCHandler('/update', onUpdate)
        setOSCHandler('/frame', setFrame)
        setOSCHandler('/sphere', updateSphere)
        startOSCServer() 